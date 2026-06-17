from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from contextlib import asynccontextmanager
import torch
import torch.nn as nn
from torchvision import models, transforms
import httpx
from PIL import Image
import io

# ── Model definition ──────────────────────────────────────────────
class SeverityHead(nn.Module):
    def __init__(self, in_features=1792):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 1),
            nn.Sigmoid(),
        )
    def forward(self, x):
        return self.net(x)

model = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

TRANSFORM = transforms.Compose([
    transforms.Resize((380, 380)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    print("Loading EfficientNet-B4...")
    backbone = models.efficientnet_b4(weights=models.EfficientNet_B4_Weights.IMAGENET1K_V1)
    in_features = backbone.classifier[1].in_features
    backbone.classifier = SeverityHead(in_features)
    backbone.eval()
    model = backbone.to(device)
    print("Model ready. NOTE: using untuned ImageNet backbone — scores are placeholders until fine-tuned.")
    yield

app = FastAPI(lifespan=lifespan)


class ScoreRequest(BaseModel):
    entry_id: str
    image_url: HttpUrl


class ScoreResponse(BaseModel):
    entry_id: str
    score: int
    confidence: float


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/score", response_model=ScoreResponse)
async def score(req: ScoreRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(str(req.image_url))
            resp.raise_for_status()

        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        tensor = TRANSFORM(img).unsqueeze(0).to(device)

        with torch.no_grad():
            raw = model(tensor).item()

        return ScoreResponse(
            entry_id=req.entry_id,
            score=round(raw * 100),
            confidence=round(abs(raw - 0.5) * 2, 3),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))