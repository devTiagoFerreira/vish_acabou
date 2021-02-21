#Alterar charset MySQL.

alter database vish_acabou charset = utf8mb4 collate = utf8mb4_bin;

#Verificar motor das tabelas (MylSAM ou innoDB).

select `engine` from information_schema.tables where table_schema="mydatabase" AND table_name = "my_table";

#Alterar motor MySQL.

alter table my_table engine = InnoDB or MyISAM;
