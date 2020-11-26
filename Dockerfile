FROM mhart/alpine-node:12

# Create app directory
# Commenting below unecessary RUN stanza, workdir creates the dir it doesnt exists.
# RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copying whole source code
COPY . /usr/src/app/
RUN npm install

# Commenting/Removing the below copy stanza,as this will create unwanted docker layer, we can use single layer (copy in above stanza)
# this will improve build time and proper caching.
# Bundle app source
# COPY . /usr/src/app

# commenting/Removing the explicit expose because its bad practice and sec flaw, moreover k8s/rancher will expose our pod.
# EXPOSE 8081

CMD [ "npm", "start" ]