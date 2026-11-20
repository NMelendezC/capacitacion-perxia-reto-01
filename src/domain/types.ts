export type OutputFormat = "xlsx" | "pdf" | "portal";
export type FieldStatus = "lleno" | "faltante" | "requiere_confirmacion";

export interface RequestData {
  id: string;
  pais: string;
  cliente: string;
  formato: OutputFormat;
  adjuntos: string[];
}

export interface RequestedField {
  etiqueta: string;
  obligatorio: boolean;
  hoja?: string;
  celdaEtiqueta?: string;
  celdaValor?: string;
}

export interface CaseData {
  request: RequestData;
  fields: RequestedField[];
  requiredSupports: string[];
}

export interface FieldMapping {
  etiqueta: string;
  obligatorio: boolean;
  estado: FieldStatus;
  ruta?: string;
  valor?: string | number | boolean;
  confianza?: number;
  nota?: string;
  hoja?: string;
  celdaEtiqueta?: string;
  celdaValor?: string;
}

export interface MappingResult {
  llenos: FieldMapping[];
  faltantes: FieldMapping[];
  requiere_confirmacion: FieldMapping[];
}

export interface SupportRecord {
  tipo: string;
  archivo: string;
  vigencia_hasta: string | null;
  pais_emisor: string;
  descripcion: string;
}

export interface ToolContext {
  directory: string;
  sessionId: string;
}

export interface ToolResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
