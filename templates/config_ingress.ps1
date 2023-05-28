$RESOURCE_GROUP_NAME='pfarg'
$AKS_NAME='pfacluster'
$LOCATION='northeurope'
$NODE_SIZE='Standard_B2s'
$DEPLOYMENT_NAME='pfacluster'
$SUBSCRIPTION_NAME='AzureForStudents'
$CUSTOM_DOMAIN='ambassamart.store'
$INGRESS_NAMESPCAE='default'

kubectl label namespace $INGRESS_NAMESPCAE cert-manager.io/disable-validation=true

# Include jetstack helm repo
helm repo add jetstack https://charts.jetstack.io
helm repo update 

#Install the cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.7.1/cert-manager.crds.yaml
helm install cert-manager jetstack/cert-manager --namespace $INGRESS_NAMESPCAE --version v1.7.1


# Create DNS records
az network dns record-set a add-record -g $RESOURCE_GROUP_NAME --ttl 3600 -z $CUSTOM_DOMAIN -n admin -a 20.67.161.72
az network dns record-set a add-record -g $RESOURCE_GROUP_NAME --ttl 3600 -z $CUSTOM_DOMAIN -n ambassador -a 20.67.161.72
az network dns record-set a list -g $RESOURCE_GROUP_NAME -z $CUSTOM_DOMAIN

$AZURE_CERT_MANAGER_SP_NAME='aksprincipalname'
$AZURE_CERT_MANAGER_DNS_RESOURCE_GROUP=$RESOURCE_GROUP_NAME
$AZURE_CERT_MANAGER_DNS_NAME=$CUSTOM_DOMAIN
$DNS_SP=$(az ad sp create-for-rbac --name $AZURE_CERT_MANAGER_SP_NAME)
$AZURE_CERT_MANAGER_SP_APP_ID=$(echo $DNS_SP | jq -r '.appId')
$AZURE_CERT_MANAGER_SP_PASSWORD=$(echo $DNS_SP | jq -r '.password')
## Lower the Permissions of the SP
$TENANT_ID=$(az account show --subscription $SUBSCRIPTION_NAME --query tenantId --output tsv)
echo $TENANT_ID
$SUBSCRIPTION_ID=$(az account show --query id -o tsv)
$USER_CLIENT_ID=$(az aks show --name $DEPLOYMENT_NAME --resource-group $RESOURCE_GROUP_NAME --query identityProfile.kubeletidentity.clientId -o tsv)
$DNSID=$(az network dns zone show --name $CUSTOM_DOMAIN --resource-group $RESOURCE_GROUP_NAME --query id -o tsv)

# Assign role
az role assignment create --assignee $AZURE_CERT_MANAGER_SP_APP_ID --role "DNS Zone Contributor" --scope $DNSID

## Create Secret
kubectl create secret generic azuredns-config --from-literal=client-secret=$AZURE_CERT_MANAGER_SP_PASSWORD

## Get the Service Principal App ID for configuration
echo "Principal: $AZURE_CERT_MANAGER_SP_APP_ID"
echo "Password: $AZURE_CERT_MANAGER_SP_PASSWORD"
echo "Important meta from SP: $DNS_SP"

kubectl apply -Rf ../k8s/