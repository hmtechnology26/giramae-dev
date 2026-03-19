
export const formatCep = (cep: string): string => {
  const numbers = cep.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
};

export const validateCep = (cep: string): boolean => {
  const numbers = cep.replace(/\D/g, '');
  return numbers.length === 8;
};

export const formatAddress = (address: {
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}): string => {
  const parts = [];
  
  if (address.endereco) {
    if (address.numero) {
      parts.push(`${address.endereco}, ${address.numero}`);
    } else {
      parts.push(address.endereco);
    }
  }
  if (address.bairro) parts.push(address.bairro);
  if (address.cidade && address.estado) {
    parts.push(`${address.cidade}/${address.estado}`);
  }
  
  return parts.join(', ');
};

export const formatCompactLocation = (address: {
  bairro?: string;
  cidade?: string;
  estado?: string;
}): string => {
  if (address.bairro && address.cidade && address.estado) {
    return `${address.bairro}, ${address.cidade}/${address.estado}`;
  }
  
  if (address.cidade && address.estado) {
    return `${address.cidade}/${address.estado}`;
  }
  
  return 'Localização não informada';
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
};

// Validar endereço completo
export const isAddressComplete = (address: any): boolean => {
  return !!(
    address?.cep && 
    address?.endereco && 
    address?.numero && 
    address?.bairro && 
    address?.cidade && 
    address?.estado
  );
};
