// Hook temporariamente desabilitado - requer migração para ledger system
export const useBonificacoes = () => {
  return {
    bonificacoesPendentes: [],
    loading: false,
    processarBonusTrocaConcluida: async () => {},
    processarBonusAvaliacao: async () => {},
    processarBonusIndicacao: async () => {},
    processarBonusCadastro: async () => {},
    verificarEProcessarMetas: async () => {}
  };
};
