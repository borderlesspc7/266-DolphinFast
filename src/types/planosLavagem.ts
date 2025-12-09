// Tipos para o sistema de Planos de Lavagem

export interface PlanoLavagem {
  id: string;
  nome: string;
  descricao: string;
  tipoVeiculo: "carro" | "moto" | "caminhao" | "onibus" | "outros";
  servicos: ServicoLavagem[];
  preco: number;
  duracaoEstimada: number; // em minutos
  frequencia?: "unico" | "semanal" | "quinzenal" | "mensal";
  ativo: boolean;
  imagem?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicoLavagem {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao: number; // em minutos
}

export interface PlanoLavagemFormData {
  nome: string;
  descricao: string;
  tipoVeiculo: "carro" | "moto" | "caminhao" | "onibus" | "outros";
  servicos: ServicoLavagem[];
  preco: number;
  duracaoEstimada: number;
  frequencia?: "unico" | "semanal" | "quinzenal" | "mensal";
  ativo: boolean;
  imagem?: string;
}


