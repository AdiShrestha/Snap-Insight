from typing import List, Dict, Any, Union, Optional, Tuple, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

# Import core functions from db_core module
from v1.db.functions import (
    get_data, insert_data, update_data, delete_data, execute_raw_query
)


async def get_single_record(
    db: AsyncSession,
    table_name: str,
    columns: Union[str, List[str]] = '*',
    where_clause: str = None,
    params: Dict[str, Any] = None
) -> Optional[Dict[str, Any]]:
    """
    Asynchronously retrieve a single record from the specified table.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to query
        columns (str/list): Columns to select. Defaults to '*'
        where_clause (str): WHERE conditions (exclude 'WHERE')
        params (dict): Parameters for the query

    Returns:
        Optional[Dict[str, Any]]: First matching record or None if not found
    """
    results = await get_data(db, table_name, columns, where_clause, params, limit=1)
    return results[0] if results else None


async def bulk_insert_data(
    db: AsyncSession,
    table_name: str,
    values_list: List[Dict[str, Any]]
) -> int:
    """
    Asynchronously insert multiple rows of data into the specified table.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to insert into
        values_list (List[dict]): List of dictionaries containing column-value pairs

    Returns:
        int: Number of rows inserted
    """
    if not values_list:
        return 0

    try:
        # Extract column names from the first dictionary
        columns = list(values_list[0].keys())

        # Build the INSERT query
        columns_str = ", ".join(columns)
        placeholders = ", ".join([f":{col}" for col in columns])
        query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"

        # Execute query for each set of values
        total_inserted = 0
        for values in values_list:
            result = await execute_raw_query(
                db,
                query,
                values,
                fetch=False
            )
            total_inserted += result

        return total_inserted

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Bulk insert error: {str(e)}"
        )


async def transaction(
    db: AsyncSession,
    operations: List[Tuple[callable, List, Dict]]
) -> List[Any]:
    """
    Execute multiple database operations in a single transaction.

    Args:
        db (AsyncSession): SQLAlchemy async session
        operations: List of tuples, each containing:
            - A function from db_core module
            - Args list for the function
            - Kwargs dict for the function

    Returns:
        List[Any]: List of results from each operation

    Example:
        results = await transaction(db, [
            (insert_data, [db, 'users', {'name': 'John'}], {}),
            (update_data, [db, 'stats', {'count': 1}], {'where_clause': 'type = :type', 'params': {'type': 'user_count'}})
        ])
    """
    results = []

    try:
        for func, args, kwargs in operations:
            # Replace db in args with our transaction session if it's the first arg
            if args and args[0] == db:
                args = list(args)
                args[0] = db

            # Call the function with args and kwargs
            result = await func(*args, **kwargs)
            results.append(result)

        return results

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transaction failed: {str(e)}"
        )


async def count_records(
    db: AsyncSession,
    table_name: str,
    where_clause: Optional[str] = None,
    params: Optional[Dict[str, Any]] = None
) -> int:
    """
    Count records in a table with optional filtering.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to query
        where_clause (str, optional): WHERE conditions (exclude 'WHERE')
        params (dict, optional): Parameters for the query

    Returns:
        int: Count of matching records
    """
    query = f"SELECT COUNT(*) as count FROM {table_name}"

    if where_clause:
        query += f" WHERE {where_clause}"

    result = await execute_raw_query(db, query, params)
    return result[0]['count'] if result else 0


async def exists(
    db: AsyncSession,
    table_name: str,
    where_clause: str,
    params: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Check if records matching the criteria exist.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to query
        where_clause (str): WHERE conditions (exclude 'WHERE')
        params (dict, optional): Parameters for the query

    Returns:
        bool: True if matching records exist, False otherwise
    """
    query = f"SELECT EXISTS(SELECT 1 FROM {table_name} WHERE {where_clause}) as exists"
    result = await execute_raw_query(db, query, params)
    return result[0]['exists'] if result else False


async def upsert_data(
    db: AsyncSession,
    table_name: str,
    values: Dict[str, Any],
    conflict_columns: Union[str, List[str]],
    update_columns: Optional[Union[str, List[str]]] = None,
    return_columns: Optional[Union[str, List[str]]] = None
) -> Union[int, Dict[str, Any]]:
    """
    Perform an upsert operation (INSERT ... ON CONFLICT ... DO UPDATE).

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table
        values (dict): Dictionary of column-value pairs
        conflict_columns (str/list): Column(s) that might conflict
        update_columns (str/list, optional): Columns to update on conflict (defaults to all except conflict columns)
        return_columns (str/list, optional): Columns to return after operation

    Returns:
        Union[int, Dict[str, Any]]: Number of rows affected or returned row data
    """
    try:
        # Convert columns to lists if they are strings
        if isinstance(conflict_columns, str):
            conflict_columns = [conflict_columns]

        # Prepare column lists
        if update_columns is None:
            update_columns = [
                col for col in values.keys() if col not in conflict_columns]
        elif isinstance(update_columns, str):
            update_columns = [update_columns]

        # Create column strings
        columns = list(values.keys())
        columns_str = ", ".join(columns)
        placeholders = ", ".join([f":{col}" for col in columns])

        # Create conflict part
        conflict_str = ", ".join(conflict_columns)

        # Create update part
        update_str = ", ".join(
            [f"{col} = EXCLUDED.{col}" for col in update_columns])

        # Build query
        query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders}) " \
            f"ON CONFLICT ({conflict_str}) DO UPDATE SET {update_str}"

        # Add RETURNING clause if specified
        if return_columns:
            if isinstance(return_columns, (list, tuple)):
                return_columns = ", ".join(return_columns)
            query += f" RETURNING {return_columns}"

        # Execute query
        result = await execute_raw_query(db, query, values, fetch=return_columns is not None)

        if return_columns:
            return result[0] if result else None
        else:
            return 1  # Upsert always affects 1 row

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upsert operation failed: {str(e)}"
        )


async def paginate(
    db: AsyncSession,
    table_name: str,
    page: int = 1,
    page_size: int = 20,
    columns: Union[str, List[str]] = '*',
    where_clause: Optional[str] = None,
    params: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get paginated results with metadata.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to query
        page (int): Page number (1-indexed)
        page_size (int): Number of items per page
        columns (str/list): Columns to select
        where_clause (str, optional): WHERE conditions
        params (dict, optional): Parameters for the query
        order_by (str, optional): ORDER BY clause

    Returns:
        Dict: {
            'items': [...],  # List of records
            'total': 100,    # Total number of records
            'page': 1,       # Current page
            'page_size': 20, # Items per page
            'pages': 5       # Total number of pages
        }
    """
    # Ensure positive page number
    page = max(1, page)

    # Get total count
    total = await count_records(db, table_name, where_clause, params)

    # Calculate offset
    offset = (page - 1) * page_size

    # Get data for current page
    items = await get_data(
        db,
        table_name,
        columns,
        where_clause,
        params,
        order_by=order_by,
        limit=page_size,
        offset=offset
    )

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return {
        'items': items,
        'total': total,
        'page': page,
        'page_size': page_size,
        'pages': total_pages
    }
