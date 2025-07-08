from typing import List, Dict, Any, Optional, Generic, TypeVar, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime

# Generic type variable for data payload
T = TypeVar('T')


class BaseResponse(BaseModel):
    """Base response model with common fields"""
    success: bool = True
    timestamp: datetime = Field(default_factory=datetime.now)

    class Config:
        extra = "allow"  # Allow extra fields


class ErrorDetail(BaseModel):
    """Error details model"""
    code: str
    message: str
    field: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseResponse):
    """Standard error response model"""
    success: bool = False
    status_code: int
    error: ErrorDetail

    class Config:
        schema_extra = {
            "example": {
                "success": False,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "status_code": 400,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid input parameters",
                    "field": "email",
                    "details": {"constraint": "must be a valid email"}
                }
            }
        }


class DataResponse(BaseResponse, Generic[T]):
    """Standard successful response model with generic data field"""
    data: T

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "data": {}  # Will be populated with actual data
            }
        }


class SingleRecordResponse(DataResponse[Dict[str, Any]]):
    """Response model for a single database record"""

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "data": {
                    "id": 1,
                    "name": "Example",
                    "created_at": "2025-03-30T10:00:00Z"
                }
            }
        }


class MultipleRecordsResponse(DataResponse[List[Dict[str, Any]]]):
    """Response model for multiple database records"""
    count: int = Field(..., description="Number of records returned")

    @validator('count', pre=True, always=True)
    def set_count_from_data(cls, v, values):
        """Automatically set count based on data length if not provided"""
        if 'data' in values and v is None:
            return len(values['data'])
        return v

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "count": 2,
                "data": [
                    {
                        "id": 1,
                        "name": "Example 1",
                        "created_at": "2025-03-30T10:00:00Z"
                    },
                    {
                        "id": 2,
                        "name": "Example 2",
                        "created_at": "2025-03-30T11:00:00Z"
                    }
                ]
            }
        }


class PaginatedResponse(MultipleRecordsResponse):
    """Response model for paginated database records"""
    page: int
    page_size: int
    total: int
    pages: int

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "count": 2,
                "page": 1,
                "page_size": 20,
                "total": 42,
                "pages": 3,
                "data": [
                    {
                        "id": 1,
                        "name": "Example 1",
                        "created_at": "2025-03-30T10:00:00Z"
                    },
                    {
                        "id": 2,
                        "name": "Example 2",
                        "created_at": "2025-03-30T11:00:00Z"
                    }
                ]
            }
        }


class InsertResponse(SingleRecordResponse):
    """Response model for INSERT operations"""
    id: Optional[Union[int, str]] = Field(
        None, description="ID of the inserted record")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "id": 42,
                "data": {
                    "id": 42,
                    "name": "New Record",
                    "created_at": "2025-03-31T12:34:56Z"
                }
            }
        }


class BulkInsertResponse(BaseResponse):
    """Response model for bulk INSERT operations"""
    count: int = Field(..., description="Number of records inserted")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "count": 5
            }
        }


class UpdateResponse(BaseResponse):
    """Response model for UPDATE operations"""
    count: int = Field(..., description="Number of records updated")
    data: Optional[Dict[str, Any]] = Field(
        None, description="Updated record (if returned)")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "count": 1,
                "data": {
                    "id": 42,
                    "name": "Updated Record",
                    "updated_at": "2025-03-31T12:34:56Z"
                }
            }
        }


class UpsertResponse(BaseResponse):
    """Response model for UPSERT operations"""
    operation: str = Field(...,
                           description="Operation performed: 'insert' or 'update'")
    data: Optional[Dict[str, Any]] = Field(
        None, description="Inserted/updated record (if returned)")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "operation": "update",
                "data": {
                    "id": 42,
                    "name": "Upserted Record",
                    "updated_at": "2025-03-31T12:34:56Z"
                }
            }
        }


class DeleteResponse(BaseResponse):
    """Response model for DELETE operations"""
    count: int = Field(..., description="Number of records deleted")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "count": 1
            }
        }


class TransactionResponse(BaseResponse):
    """Response model for transaction operations"""
    results: List[Dict[str, Any]
                  ] = Field(..., description="Results of each operation in the transaction")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "results": [
                    {"operation": "insert", "id": 42},
                    {"operation": "update", "count": 1}
                ]
            }
        }


class ExistsResponse(BaseResponse):
    """Response model for EXISTS checks"""
    exists: bool

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "exists": True
            }
        }


class CountResponse(BaseResponse):
    """Response model for COUNT operations"""
    count: int

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "timestamp": "2025-03-31T12:34:56.789Z",
                "count": 42
            }
        }
