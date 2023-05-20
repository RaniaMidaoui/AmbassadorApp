$RESOURCE_GROUP_NAME='pfarg'
$AKS_NAME='pfacluster'
$LOCATION='northeurope'
$NODE_SIZE='Standard_B2s'
$DEPLOYMENT_NAME='pfacluster'
$SUBSCRIPTION_NAME='AzureForStudents'
$CUSTOM_DOMAIN='ambassamart.store'
$INGRESS_NAMESPCAE='default'


az login
# Create the resource group
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# Deploy the AKS cluster from template
az deployment group create --name $DEPLOYMENT_NAME --resource-group $RESOURCE_GROUP_NAME --template-file "./akscluster.json"  --parameters aksClusterName=$AKS_NAME dnsPrefix=pfa agentCount=1 agentVMSize=$NODE_SIZE

# Connect to the cluster
az aks get-credentials --resource-group $RESOURCE_GROUP_NAME --name $DEPLOYMENT_NAME

# Configure ingress and TLS
# Create a DNS Zone for custom Domain
az network dns zone create -g $RESOURCE_GROUP_NAME -n $CUSTOM_DOMAIN

# Create a namespace for ingress resources
#kubectl create namespace $INGRESS_NAMESPCAE

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.7.1/deploy/static/provider/cloud/deploy.yaml

# Assign managed identity of cluster’s node pools DNS Zone Contributor rights on to Custom Domain DNS zone.
$TENANT_ID=$(az account show --subscription $SUBSCRIPTION_NAME --query tenantId --output tsv)
echo $TENANT_ID
$SUBSCRIPTION_ID=$(az account show --query id -o tsv)
$USER_CLIENT_ID=$(az aks show --name $DEPLOYMENT_NAME --resource-group $RESOURCE_GROUP_NAME --query identityProfile.kubeletidentity.clientId -o tsv)
$DNSID=$(az network dns zone show --name $CUSTOM_DOMAIN --resource-group $RESOURCE_GROUP_NAME --query id -o tsv)
az role assignment create --assignee $USER_CLIENT_ID --role 'DNS Zone Contributor' --scope $DNSID

#Deploy external DNS
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install external-dns bitnami/external-dns --namespace $INGRESS_NAMESPCAE --set provider=azure --set txtOwnerId=$DEPLOYMENT_NAME --set policy=sync --set azure.resourceGroup=$RESOURCE_GROUP_NAME --set azure.tenantId=$TENANT_ID --set azure.subscriptionId=$SUBSCRIPTION_ID --set azure.useManagedIdentityExtension=true --set azure.userAssignedIdentityID=$USER_CLIENT_ID

# Generete a secret:
kubectl create secret generic pgpassword --from-literal PGPASSWORD=azerty --namespace $INGRESS_NAMESPCAE

# Deploy app
kubectl apply -Rf ..\k8s --namespace $INGRESS_NAMESPCAE



