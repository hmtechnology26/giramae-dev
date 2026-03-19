
import React from 'react';
import CheckoutMercadoPago from './CheckoutMercadoPago';

// 🔄 MIGRAÇÃO: Este componente agora usa Mercado Pago em vez de Stripe
const CompraLivre = () => {
  return <CheckoutMercadoPago />;
};

export default CompraLivre;
