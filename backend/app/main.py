from fastapi import FastAPI
from app.api import auth, protocols

app = FastAPI(title="IRB System")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(protocols.router, prefix="/protocols", tags=["protocols"])

@app.get("/")
def root():
    return {"message": "IRB API Running"}