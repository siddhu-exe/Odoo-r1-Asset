from uuid import UUID

from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    def __init__(self, entity: str, identifier: UUID | str) -> None:
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity} with identifier '{identifier}' was not found.",
        )


class ConflictError(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=message)


class ForbiddenError(HTTPException):
    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=message)


class UnauthorizedError(HTTPException):
    def __init__(self, message: str = "Authentication credentials are missing or invalid.") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ValidationError(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)
