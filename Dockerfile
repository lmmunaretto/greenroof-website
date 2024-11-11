# Usa uma imagem leve do Nginx para servir o site estático
FROM nginx:alpine

# Copia todo o conteúdo do projeto para o diretório padrão do Nginx
COPY . /usr/share/nginx/html

# Exponha a porta padrão do Nginx
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
