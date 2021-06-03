-- Empresas

insert into tb_status_empresa values 
(0, 'Aguardando aprovação'), (0, 'Ativa'), (0, 'Inativa');

-- Anúncios

insert into tb_status_anuncio values 
(0, 'Inativo'), (0, 'Ativo');

-- Clientes

insert into tb_status_cliente values 
(0, 'Inativo'), (0, 'Ativo');

-- Vendas

insert into tb_status_pagamento values 
(0, 'Aguardando aprovação'), (0, 'Negado'), (0, 'Aprovado');

-- Comissão Vendas

insert into tb_comissao values 
(0, 5);

-- Admin

insert into tb_admin values (0, 'vishacabou@vishacabou.com.br','$2b$10$vfoS1N16cNFkiNGr3nZiOOR5M5JCYCGUJPeVk90e0/81e1ci6FeiO', null, 'Vish', 'Acabou', '2021/06/03', default);
