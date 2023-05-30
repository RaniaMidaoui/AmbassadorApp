$RESOURCE_GROUP_NAME='pfarg'
$AKS_NAME='pfacluster'
$LOCATION='northeurope'
$NODE_SIZE='Standard_B2s'
$DEPLOYMENT_NAME='pfacluster'
$SUBSCRIPTION_NAME='AzureForStudents'
$CUSTOM_DOMAIN='ambassamart.store'
$INGRESS_NAMESPCAE='default'
$LOG_ANALY_NAME='ambassamart'

# Create a Log Analytics Workspace and get its ID
$LOG_ANALY_ID=$(az monitor log-analytics workspace create --resource-group $RESOURCE_GROUP_NAME --workspace-name $LOG_ANALY_NAME --query id -o tsv)
# Enable monitoring on the cluster when creating it, if not already created, else go to Insights on the portal and enable log analytics monitoring
#az aks create --resource-group $RESOURCE_GROUP_NAM --name $AKS_NAME --node-count 2 --enable-addons monitoring --workspace-resource-id $LOG_ANALY_ID

# Get resource group ID
$RG_ID=$(az group show --name  pfarg --query id --output tsv)

# Create a service principal and assign Log Analytics Reader role to the resource group
az ad sp create-for-rbac --role="Log Analytics Reader" --scopes="/subscriptions/5dfcf723-ea7b-4a89-b344-86968954d351/resourceGroups/pfarg"

# Add Grafana repo
helm repo add grafana https://grafana.github.io/helm-charts
helm search repo grafana

# Creating a monitoring namespace for Grafana
kubectl create namespace monitoring

# Install Grafana on AKS Clutser
helm install stable grafana/grafana -n monitoring
kubectl get pods -n monitoring

# Expose Grafana, port forward to the Grafana Service
kubectl port-forward -n monitoring stable-grafana-5ff7f9657-6jcpj 3000

# Get Grafana admin password (base64 format, needs to be decoded) #10956
kubectl get secret --namespace monitoring stable-grafana -o jsonpath="{.data.admin-password}





