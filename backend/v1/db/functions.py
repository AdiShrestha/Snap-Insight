import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import Any, Dict, List, Optional, Union
# Core CRUD Functions


async def get_data(
    db: AsyncSession,
    table_name: str,
    columns: Union[str, List[str]] = '*',
    where_clause: Optional[str] = None,
    params: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Asynchronously retrieve data from the specified table.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to query
        columns (str/list): Columns to select. Defaults to '*'
        where_clause (str, optional): WHERE conditions (exclude 'WHERE')
        params (dict, optional): Parameters for the query
        order_by (str, optional): ORDER BY clause (exclude 'ORDER BY')
        limit (int, optional): Maximum number of records to return
        offset (int, optional): Number of records to skip

    Returns:
        List[Dict[str, Any]]: Query results as a list of dictionaries
    """
    # Convert columns list to comma-separated string
    if isinstance(columns, (list, tuple)):
        columns = ', '.join(columns)

    # Build base query
    query = f"SELECT {columns} FROM {table_name}"

    # Add WHERE clause if specified
    if where_clause:
        query += f" WHERE {where_clause}"

    # Add ORDER BY if specified
    if order_by:
        query += f" ORDER BY {order_by}"

    # Add LIMIT if specified
    if limit is not None:
        query += f" LIMIT {limit}"

    # Add OFFSET if specified
    if offset is not None:
        query += f" OFFSET {offset}"

    # Execute query with parameters
    result = await db.execute(text(query), params or {})
    return [dict(row) for row in result.mappings()]


async def insert_data(
    db: AsyncSession,
    table_name: str,
    values: Dict[str, Any],
    return_columns: Optional[Union[str, List[str]]] = None
) -> Union[int, Dict[str, Any]]:
    """
    Asynchronously insert data into the specified table.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to insert into
        values (dict): Dictionary of column-value pairs to insert
        return_columns (str/list, optional): Columns to return after insert

    Returns:
        Union[int, Dict[str, Any]]: Number of rows inserted or the returned row
    """
    try:
        # Extract column names and parameter placeholders
        columns = list(values.keys())
        placeholders = [f":{col}" for col in columns]

        # Build the INSERT query
        columns_str = ", ".join(columns)
        values_str = ", ".join(placeholders)

        query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({values_str})"

        # Add RETURNING clause if specified
        if return_columns:
            if isinstance(return_columns, (list, tuple)):
                return_columns = ", ".join(return_columns)
            query += f" RETURNING {return_columns}"
            result = await db.execute(text(query), values)
            await db.commit()
            row = result.fetchone()
            return dict(row) if row else None
        else:
            result = await db.execute(text(query), values)
            await db.commit()
            return result.rowcount

    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Integrity constraint violated: {str(e)}"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


async def update_data(
    db: AsyncSession,
    table_name: str,
    set_values: Dict[str, Any],
    where_clause: Optional[str] = None,
    params: Optional[Dict[str, Any]] = None,
    return_columns: Optional[Union[str, List[str]]] = None
) -> Union[int, List[Dict[str, Any]]]:
    """
    Asynchronously update data in the specified table.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to update
        set_values (dict): Dictionary of column-value pairs to update
        where_clause (str, optional): WHERE conditions (exclude 'WHERE')
        params (dict, optional): Parameters for the query
        return_columns (str/list, optional): Columns to return after update

    Returns:
        Union[int, List[Dict[str, Any]]]: Number of rows affected or the returned rows
    """
    try:
        # Build SET clause from dictionary
        set_clause = ", ".join(
            [f"{key} = :{key}" for key in set_values.keys()])

        # Build base query
        query = f"UPDATE {table_name} SET {set_clause}"

        # Add WHERE clause if specified
        if where_clause:
            query += f" WHERE {where_clause}"

        # Add RETURNING clause if specified
        if return_columns:
            if isinstance(return_columns, (list, tuple)):
                return_columns = ", ".join(return_columns)
            query += f" RETURNING {return_columns}"

        # Combine set_values with additional params
        all_params = {**set_values, **(params or {})}

        # Execute query with parameters
        result = await db.execute(text(query), all_params)
        await db.commit()

        if return_columns:
            return [dict(row) for row in result.mappings()]
        else:
            return result.rowcount

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


async def delete_data(
    db: AsyncSession,
    table_name: str,
    where_clause: Optional[str] = None,
    params: Optional[Dict[str, Any]] = None,
    return_columns: Optional[Union[str, List[str]]] = None
) -> Union[int, List[Dict[str, Any]]]:
    """
    Asynchronously delete data from the specified table.

    Args:
        db (AsyncSession): SQLAlchemy async session
        table_name (str): Name of the table to delete from
        where_clause (str, optional): WHERE conditions (exclude 'WHERE')
        params (dict, optional): Parameters for the query
        return_columns (str/list, optional): Columns to return after deletion

    Returns:
        Union[int, List[Dict[str, Any]]]: Number of rows deleted or the returned rows
    """
    try:
        # Build base query
        query = f"DELETE FROM {table_name}"

        # Add WHERE clause if specified
        if where_clause:
            query += f" WHERE {where_clause}"
        else:
            # Safety check to prevent accidental deletion of all rows
            raise HTTPException(
                status_code=400,
                detail="DELETE operation requires a WHERE clause. If you intend to delete all rows, use where_clause='1=1'"
            )

        # Add RETURNING clause if specified
        if return_columns:
            if isinstance(return_columns, (list, tuple)):
                return_columns = ", ".join(return_columns)
            query += f" RETURNING {return_columns}"

        # Execute query with parameters
        result = await db.execute(text(query), params or {})
        await db.commit()

        if return_columns:
            return [dict(row) for row in result.mappings()]
        else:
            return result.rowcount

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )


async def execute_raw_query(
    db: AsyncSession,
    query: str,
    params: Optional[Dict[str, Any]] = None,
    fetch: bool = True
) -> Union[List[Dict[str, Any]], int]:
    """
    Execute a raw SQL query. Use with caution!

    Args:
        db (AsyncSession): SQLAlchemy async session
        query (str): Raw SQL query to execute
        params (dict, optional): Parameters for the query
        fetch (bool): Whether to fetch results or just return affected rows count

    Returns:
        Union[List[Dict[str, Any]], int]: Query results or number of affected rows
    """
    try:
        result = await db.execute(text(query), params or {})

        if fetch:
            return [dict(row) for row in result.mappings()]
        else:
            await db.commit()
            return result.rowcount

    except Exception as e:
        if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
            await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Query execution error: {str(e)}"
        )
