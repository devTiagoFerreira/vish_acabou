create database bd_vish_acabou;

use bd_vish_acabou;

alter database bd_vish_acabou charset = utf8mb4 collate = utf8mb4_0900_ai_ci;

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
    constraint FK_status_empresa foreign key (estado) references tb_estados (id)
);

create table tb_contato_empresa (
	id int auto_increment not null primary key,
    id_empresa int not null,
    numero varchar(16),
    whatsapp bool,
    constraint FK_empresa foreign key (id_empresa) references tb_empresas(id)
);