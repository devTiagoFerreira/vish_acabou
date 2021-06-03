create database bd_vish_acabou;

use bd_vish_acabou;

alter database bd_vish_acabou charset = utf8mb4 collate = utf8mb4_0900_ai_ci;

-- Empresas

create table tb_status_empresa (
	id int auto_increment not null primary key,
    status_empresa varchar(30) not null unique
);

create table tb_empresas (
	id int auto_increment not null primary key,
    email varchar(100) not null unique,
    senha varchar(100) not null,
    logo varchar(100),
    razao_social varchar(100) not null,
    nome_fantasia varchar(100),
    ie varchar(15) not null unique,
    cnpj varchar(18) not null unique,
    conta varchar(20) not null,
    agencia varchar(20) not null,
    site varchar(100),
    cep varchar(9) not null,
    logradouro varchar(100) not null,
	numero varchar(10) not null,
	bairro varchar(50) not null,
	complemento varchar(50),
	cidade int not null,
	estado int not null,
	data_cadastro datetime default current_timestamp not null,
	id_status_empresa int default 1 not null,
    constraint FK_status_empresa foreign key (id_status_empresa) references tb_status_empresa (id),
    constraint FK_cidade foreign key (cidade) references tb_cidades (id),
    constraint FK_estado foreign key (estado) references tb_estados (id)
);

create table tb_contato_empresa (
	id int auto_increment not null primary key,
    id_empresa int not null,
    numero varchar(16),
    whatsapp bool,
    constraint FK_empresa foreign key (id_empresa) references tb_empresas(id)
);

-- Anúncios

create table tb_status_anuncio (
	id int auto_increment not null primary key,
    status_anuncio varchar(30) not null unique
);

create table tb_anuncios (
	id int auto_increment not null primary key,
	id_empresa int not null,
    banner varchar(100) not null,
    titulo varchar(100) not null,
    descricao text not null,
    regras text not null,
    preco float not null,
    desconto tinyint unsigned not null,
    data_inicial datetime default current_timestamp not null,
    vencimento datetime not null,
    quant_tickets tinyint unsigned not null,
    vendidos tinyint unsigned default 0 not null,
    id_status_anuncio int default 1 not null,
    constraint FK_id_empresa foreign key (id_empresa) references tb_empresas (id),
    constraint FK_status_anuncio foreign key (id_status_anuncio) references tb_status_anuncio (id)
);

-- Clientes

create table tb_status_cliente (
	id int auto_increment not null primary key,
    status_cliente varchar(30) not null
);

create table tb_clientes (
    id int auto_increment not null primary key,
    email varchar(50) not null unique,
    senha varchar(100) not null,
    foto varchar(100),
    nome varchar(50) not null,
    sobrenome varchar(100) not null,
    data_nasc date,
    genero varchar(30),
    cep varchar(9) not null,
    logradouro varchar(100) not null,
    numero varchar(10) not null,
    bairro varchar(50) not null,
    complemento varchar(50),
    cidade varchar(50) not null,
    estado varchar(20) not null,
    data_cadastro datetime default current_timestamp not null,
    id_status_cliente int default 1 not null,
    constraint FK_status_cliente foreign key (id_status_cliente) references tb_status_cliente (id)
);

-- Vendas

create table tb_status_pagamento (
	id int auto_increment not null primary key,
    status_pagamento varchar(30) not null
);

create table tb_vendas (
	id int auto_increment not null primary key,
    id_anuncio int not null,
    id_cliente int not null,
    data_compra datetime default current_timestamp not null,
    quantidade tinyint unsigned not null,
    cod_ticket varchar(20),
    status_pagamento int not null default 1,
    constraint FK_anuncio foreign key (id_anuncio) references tb_anuncios (id),
    constraint FK_cliente foreign key (id_cliente) references tb_clientes (id),
    constraint FK_status_pagamento foreign key (status_pagamento) references tb_status_pagamento (id)
);

-- Admin

create table tb_admin (
	id int auto_increment not null primary key,
	email varchar(50) not null unique,
	senha varchar(100) not null,
	foto varchar(100),
	nome varchar(50) not null,
	sobrenome varchar(100) not null,
	data_nasc date,
	data_cadastro datetime default current_timestamp not null
);

-- Comissão

create table tb_comissao (
	id int primary key auto_increment,
    comissao int not null
);
