#Alterar charset do banco de dados.

alter database my_database charset = utf8mb4 collate = utf8mb4_0900_ai_ci;

#Alterar charset das tabelas

alter table  my_table convert to character set utf8mb4 collate utf8mb4_0900_ai_ci;

#Verificar motor das tabelas (MylSAM ou innoDB).

select `engine` from information_schema.tables where table_schema="mydatabase" AND table_name = "my_table";

#Alterar motor MySQL.

alter table my_table engine = InnoDB or MyISAM;

#Pesquisas case-insensitive

collate utf8mb4_0900_ai_ci;
