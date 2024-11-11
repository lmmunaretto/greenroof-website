# Use a imagem oficial do Nginx como base
FROM nginx:alpine

# Remova qualquer configuração padrão do Nginx que possa interferir
RUN rm /etc/nginx/conf.d/default.conf

# Copie seu arquivo nginx.conf personalizado para o diretório de configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie todos os arquivos HTML, CSS, JS e outros recursos para o diretório padrão do Nginx
COPY . /usr/share/nginx/html

# Exponha a porta 80 para que o Railway saiba qual porta o container está escutando
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
