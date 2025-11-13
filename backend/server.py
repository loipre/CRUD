from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta, date
from passlib.context import CryptContext
import jwt
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production-' + secrets.token_hex(32))
ALGORITHM = "HS256"

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # admin, editor, user
    approved: bool = False
    approved_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    invite_code: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class InviteCode(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str = Field(default_factory=lambda: secrets.token_urlsafe(12))
    created_by: str
    role_assigned: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    max_uses: int = 1
    used_count: int = 0
    used_by: List[str] = []

class InviteCodeCreate(BaseModel):
    role_assigned: str
    max_uses: int = 1
    expires_hours: int = 168  # 7 days default

class SerialNumberInfo(BaseModel):
    has_component: bool = False
    model_type: Optional[str] = None  # "modelo_1" or "modelo_2"
    serial_number: Optional[str] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Identificação
    tag: str
    num_pavian: str
    
    # Datas
    data_instalacao: Optional[str] = None
    data_atualizacao: Optional[str] = None
    data_vencimento_garantia: Optional[str] = None
    
    # Modelo e Configuração
    modelo_pavian: str
    potencia_pavian_existente: str
    situacao_proposta: str
    status_implantacao: str
    
    # Localização
    regiao: str
    complexo: str
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    config_tipo_montagem: str
    azimute: Optional[str] = None
    
    # Repetidoras
    repetidora_a_principal: str
    repetidora_b_redundante: str
    
    # Firmware e Configurações
    firmware_radio: str
    tipo_melodia: str
    prioridade_alarmes: str
    
    # IDs de Canal
    id_canal_primario: str
    id_canal_secundario: str
    
    # Rádios
    serial_radio_primario: str
    modelo_radio_primario: str
    serial_radio_secundario: str
    modelo_radio_secundario: str
    
    # Conversores
    serial_conv_primario: str
    serial_conv_secundario: str
    
    # Placa Mãe
    firmware_placa_mae: str
    placa_mae: SerialNumberInfo
    
    # Fonte
    fonte: SerialNumberInfo
    
    # Placas de Comunicação
    placa_comunicacao_primaria: SerialNumberInfo
    placa_comunicacao_secundaria: SerialNumberInfo
    
    # Amplificadores (10 slots)
    amplificadores: List[SerialNumberInfo] = []
    
    # Observações
    observacoes: Optional[str] = None
    
    # Metadata
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    tag: str
    num_pavian: str
    data_instalacao: Optional[str] = None
    data_atualizacao: Optional[str] = None
    data_vencimento_garantia: Optional[str] = None
    modelo_pavian: str
    potencia_pavian_existente: str
    situacao_proposta: str
    status_implantacao: str
    regiao: str
    complexo: str
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    config_tipo_montagem: str
    azimute: Optional[str] = None
    repetidora_a_principal: str
    repetidora_b_redundante: str
    firmware_radio: str
    tipo_melodia: str
    prioridade_alarmes: str
    id_canal_primario: str
    id_canal_secundario: str
    serial_radio_primario: str
    modelo_radio_primario: str
    serial_radio_secundario: str
    modelo_radio_secundario: str
    serial_conv_primario: str
    serial_conv_secundario: str
    firmware_placa_mae: str
    placa_mae: SerialNumberInfo
    fonte: SerialNumberInfo
    placa_comunicacao_primaria: SerialNumberInfo
    placa_comunicacao_secundaria: SerialNumberInfo
    amplificadores: List[SerialNumberInfo] = []
    observacoes: Optional[str] = None

class ProductUpdate(BaseModel):
    tag: Optional[str] = None
    num_pavian: Optional[str] = None
    data_instalacao: Optional[str] = None
    data_atualizacao: Optional[str] = None
    data_vencimento_garantia: Optional[str] = None
    modelo_pavian: Optional[str] = None
    potencia_pavian_existente: Optional[str] = None
    situacao_proposta: Optional[str] = None
    status_implantacao: Optional[str] = None
    regiao: Optional[str] = None
    complexo: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    config_tipo_montagem: Optional[str] = None
    azimute: Optional[str] = None
    repetidora_a_principal: Optional[str] = None
    repetidora_b_redundante: Optional[str] = None
    firmware_radio: Optional[str] = None
    tipo_melodia: Optional[str] = None
    prioridade_alarmes: Optional[str] = None
    id_canal_primario: Optional[str] = None
    id_canal_secundario: Optional[str] = None
    serial_radio_primario: Optional[str] = None
    modelo_radio_primario: Optional[str] = None
    serial_radio_secundario: Optional[str] = None
    modelo_radio_secundario: Optional[str] = None
    serial_conv_primario: Optional[str] = None
    serial_conv_secundario: Optional[str] = None
    firmware_placa_mae: Optional[str] = None
    placa_mae: Optional[SerialNumberInfo] = None
    fonte: Optional[SerialNumberInfo] = None
    placa_comunicacao_primaria: Optional[SerialNumberInfo] = None
    placa_comunicacao_secundaria: Optional[SerialNumberInfo] = None
    amplificadores: Optional[List[SerialNumberInfo]] = None
    observacoes: Optional[str] = None

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entity_type: str  # user, product, invite_code
    entity_id: str
    action: str  # create, update, delete, approve
    changes: Dict[str, Any]
    performed_by: str
    user_name: str
    user_email: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== AUTH HELPERS ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        if not user.get("approved", False):
            raise HTTPException(status_code=403, detail="User not approved by admin")
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_role(user: User, allowed_roles: List[str]):
    if user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

async def log_audit(entity_type: str, entity_id: str, action: str, changes: Dict, user: User):
    audit = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        changes=changes,
        performed_by=user.id,
        user_name=user.name,
        user_email=user.email
    )
    doc = audit.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.audit_logs.insert_one(doc)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    invite = await db.invite_codes.find_one({"code": user_data.invite_code}, {"_id": 0})
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid invite code")
    
    invite_obj = InviteCode(**invite)
    
    if invite_obj.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invite code expired")
    
    if invite_obj.used_count >= invite_obj.max_uses:
        raise HTTPException(status_code=400, detail="Invite code already used")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=invite_obj.role_assigned,
        approved=False
    )
    
    user_doc = user.model_dump()
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    user_doc['password_hash'] = get_password_hash(user_data.password)
    
    await db.users.insert_one(user_doc)
    
    await db.invite_codes.update_one(
        {"code": user_data.invite_code},
        {
            "$inc": {"used_count": 1},
            "$push": {"used_by": user.id}
        }
    )
    
    return {"message": "Registration successful. Waiting for admin approval.", "user_id": user.id}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get('approved', False):
        raise HTTPException(status_code=403, detail="Account pending admin approval")
    
    access_token = create_access_token({"sub": user['id']})
    
    user_obj = User(**user)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_obj.model_dump()
    }

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== USER ROUTES ====================

@api_router.get("/users/pending")
async def get_pending_users(current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin"])
    users = await db.users.find({"approved": False}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.post("/users/{user_id}/approve")
async def approve_user(user_id: str, current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin"])
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"approved": True, "approved_by": current_user.id}}
    )
    
    await log_audit("user", user_id, "approve", {"approved": True}, current_user)
    
    return {"message": "User approved"}

@api_router.get("/users")
async def get_all_users(current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin"])
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

# ==================== INVITE CODE ROUTES ====================

@api_router.post("/invite-codes/generate")
async def generate_invite_code(code_data: InviteCodeCreate, current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin"])
    
    if code_data.role_assigned not in ["admin", "editor", "user"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    expires_at = datetime.now(timezone.utc) + timedelta(hours=code_data.expires_hours)
    
    invite = InviteCode(
        created_by=current_user.id,
        role_assigned=code_data.role_assigned,
        expires_at=expires_at,
        max_uses=code_data.max_uses
    )
    
    doc = invite.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['expires_at'] = doc['expires_at'].isoformat()
    
    await db.invite_codes.insert_one(doc)
    
    await log_audit("invite_code", invite.code, "create", {"role": code_data.role_assigned}, current_user)
    
    return invite

@api_router.get("/invite-codes")
async def get_invite_codes(current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin"])
    codes = await db.invite_codes.find({}, {"_id": 0}).to_list(1000)
    return codes

@api_router.get("/invite-codes/validate/{code}")
async def validate_invite_code(code: str):
    invite = await db.invite_codes.find_one({"code": code}, {"_id": 0})
    if not invite:
        return {"valid": False, "message": "Invalid code"}
    
    invite_obj = InviteCode(**invite)
    
    if invite_obj.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return {"valid": False, "message": "Code expired"}
    
    if invite_obj.used_count >= invite_obj.max_uses:
        return {"valid": False, "message": "Code already used"}
    
    return {"valid": True, "role": invite_obj.role_assigned}

# ==================== PRODUCT ROUTES ====================

@api_router.post("/products")
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin", "editor"])
    
    product = Product(
        **product_data.model_dump(),
        created_by=current_user.id
    )
    
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.products.insert_one(doc)
    
    await log_audit("product", product.id, "create", {"tag": product.tag, "num_pavian": product.num_pavian}, current_user)
    
    return product

@api_router.get("/products")
async def get_products(current_user: User = Depends(get_current_user)):
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str, current_user: User = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductUpdate, current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin", "editor"])
    
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    await log_audit("product", product_id, "update", update_data, current_user)
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_user)):
    await require_role(current_user, ["admin", "editor"])
    
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.products.delete_one({"id": product_id})
    
    await log_audit("product", product_id, "delete", {"tag": product.get('tag')}, current_user)
    
    return {"message": "Product deleted"}

# ==================== AUDIT LOG ROUTES ====================

@api_router.get("/audit-logs")
async def get_audit_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    await require_role(current_user, ["admin", "editor"])
    
    query = {}
    if entity_type:
        query['entity_type'] = entity_type
    if entity_id:
        query['entity_id'] = entity_id
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return logs

# ==================== INITIALIZATION ====================

@api_router.post("/init-admin")
async def initialize_admin():
    admin = await db.users.find_one({"role": "admin"})
    if admin:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    admin_user = User(
        email="admin@system.com",
        name="System Administrator",
        role="admin",
        approved=True
    )
    
    admin_doc = admin_user.model_dump()
    admin_doc['created_at'] = admin_doc['created_at'].isoformat()
    admin_doc['password_hash'] = get_password_hash("admin123")
    
    await db.users.insert_one(admin_doc)
    
    invite = InviteCode(
        created_by=admin_user.id,
        role_assigned="editor",
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        max_uses=10
    )
    
    invite_doc = invite.model_dump()
    invite_doc['created_at'] = invite_doc['created_at'].isoformat()
    invite_doc['expires_at'] = invite_doc['expires_at'].isoformat()
    
    await db.invite_codes.insert_one(invite_doc)
    
    return {
        "message": "Admin initialized",
        "email": "admin@system.com",
        "password": "admin123",
        "sample_invite_code": invite.code
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()