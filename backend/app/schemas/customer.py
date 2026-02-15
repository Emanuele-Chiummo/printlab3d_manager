from pydantic import BaseModel


class CustomerBase(BaseModel):
    tipo_cliente: str = "DITTA"  # DITTA o PERSONA
    ragione_sociale: str = ""
    nome: str = ""
    cognome: str = ""
    codice_fiscale: str = ""
    piva: str = ""
    email: str = ""
    telefono: str = ""
    indirizzo: str = ""
    note: str = ""


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    tipo_cliente: str | None = None
    ragione_sociale: str | None = None
    nome: str | None = None
    cognome: str | None = None
    codice_fiscale: str | None = None
    piva: str | None = None
    email: str | None = None
    telefono: str | None = None
    indirizzo: str | None = None
    note: str | None = None


class CustomerOut(CustomerBase):
    id: int

    class Config:
        from_attributes = True
