

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
    foreign key (id_status_cliente) references tb_status_cliente (id)
);

create table tb_status_amigo (
	id int auto_increment not null primary key,
    status_amigo varchar(30) not null
);

create table tb_amigos (
	solicitante int not null,
    solicitado int not null,
    data_solic datetime default current_timestamp not null,
    data_atividade datetime,
    id_status_amigo int default 1 not null,
    primary key (solicitante, solicitado),
    foreign key (solicitante) references tb_clientes (id),
	foreign key (solicitado) references tb_clientes (id)
);

create table tb_status_msg (
	id int auto_increment not null primary key,
    status_msg varchar(30) not null
);

create table tb_mensagens (
	id int auto_increment not null primary key,
    remetente int not null,
    destinatario int not null,
    mensagem text(2000) not null,
    data_envio datetime default current_timestamp not null,
    id_status_msg int default 1 not null,
    foreign key (remetente) references tb_clientes (id),
    foreign key (destinatario) references tb_clientes (id),
    foreign key (id_status_msg) references tb_status_msg (id)
);

create table tb_status_seguidor (
	id int auto_increment not null primary key,
    status_seguidor varchar(30) not null
);

create table tb_seguidores (
	id int auto_increment not null primary key,
    id_cliente int not null,
    id_empresa int not null,
    data_envio datetime default current_timestamp not null,
    id_status_seguidor int default 1 not null,
    foreign key (id_cliente) references tb_clientes (id),
    foreign key (id_empresa) references tb_empresas (id),
    foreign key (id_status_seguidor) references tb_status_seguidor (id)
);

create table tb_contato_cliente (
	id int auto_increment not null primary key,
    id_cliente int not null,
    telefone varchar(16),
    whatsapp varchar(16),
    foreign key (id_cliente) references tb_clientes(id)
);

create table tb_contato_empresa (
	id int auto_increment not null primary key,
    id_empresa int not null,
    telefone varchar(16),
    whatsapp varchar(16),
    foreign key (id_empresa) references tb_empresas(id)
);

create table tb_status_notif (
	id int auto_increment not null primary key,
    status_notif varchar(30) not null
);

create table tb_notificacao_clientes (
	id int auto_increment not null,
    id_cliente int not null,
    titulo varchar(30) not null,
    mensagem text(2000) not null,
    data_envio datetime default current_timestamp not null,
    id_status_notif int default 1 not null,
    primary key (id, id_cliente),
    foreign key (id_cliente) references tb_clientes (id),
    foreign key (id_status_notif) references tb_status_notif (id)
);

create table tb_status_anuncio (
	id int auto_increment not null primary key,
    status_anuncio varchar(30) not null
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
    duracao datetime not null,
    quant_tickets tinyint unsigned not null,
    vendidos tinyint unsigned not null,
    id_status_anuncio int default 1 not null,
    foreign key (id_empresa) references tb_empresas (id),
    foreign key (id_status_anuncio) references tb_status_anuncio (id)
);

create table tb_vendas (
	id int auto_increment not null primary key,
    id_anuncio int not null,
    id_cliente int not null,
    indicante int not null default 0,
    data_compra datetime default current_timestamp not null,
    quantidade tinyint unsigned not null,
    cod_ticket varchar(20),
    status_venda int not null default 1,
    status_pagamento int null default 1,
    constraint FK_anuncio foreign key (id_anuncio) references tb_anuncios (id),
    constraint FK_cliente foreign key (id_cliente) references tb_clientes (id),
    constraint FK_indicante foreign key (indicante) references tb_clientes (id),
	constraint FK_status_venda foreign key (status_venda) references tb_status_venda (id),
    constraint FK_status_pagamento foreign key (status_pagamento) references tb_status_pagamento (id)
);

create table tb_redes_sociais (
	id int auto_increment not null primary key,
    rede_social varchar(20) not null,
    icone varchar(100) not null
);

create table tb_social_cliente (
	id_cliente int not null,
    id_rede_social int not null,
    link varchar(100) not null,
    primary key (id_cliente, id_rede_social),
    foreign key (id_cliente) references tb_clientes (id),
    foreign key (id_rede_social) references tb_redes_sociais (id)
);

create table tb_social_empresa (
	id_empresa int not null,
    id_rede_social int not null,
    link varchar(100) not null,
    primary key (id_empresa, id_rede_social),
    foreign key (id_empresa) references tb_empresas (id),
    foreign key (id_rede_social) references tb_redes_sociais (id)
);

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

create table tb_estados (
	id int auto_increment primary key,
    sigla char(2) not null unique,
    nome varchar(20) not null unique
);

create table tb_cidades_empresas (
	id int auto_increment primary key,
    id_estado int not null,
    nome varchar(100) not null,
    foreign key (id_estado) references tb_estados (id)
);



