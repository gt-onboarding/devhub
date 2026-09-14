Ao final, você terá:

* Um gerenciador de tokens que obtém e armazena em cache as credenciais do Lakebase Postgres, com refresh automático antes da expiração
* Suporte a autenticação direta por token (desenvolvimento local) e a OAuth M2M (produção)
* Um script opcional de desenvolvimento local para fazer o refresh do token do seu workspace no arquivo .env