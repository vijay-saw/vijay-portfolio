pipeline {
    agent { label 'azure-agent' }

    environment {
        REGISTRY = "portfoliovijay.azurecr.io"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                docker build -t $REGISTRY/portfolio-frontend:$IMAGE_TAG \
                    -f frontend/Dockerfile.frontend frontend/
                '''
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                docker build -t $REGISTRY/portfolio-backend:$IMAGE_TAG \
                    -f Dockerfile.backend .
                '''
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'portfoliovijay', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                    echo "$PASS" | docker login $REGISTRY -u "$USER" --password-stdin
                    docker push $REGISTRY/portfolio-frontend:$IMAGE_TAG
                    docker push $REGISTRY/portfolio-backend:$IMAGE_TAG
                    '''
                }
            }
        }

        stage('Update Manifests') {
            steps {
                sh './kubernetes-manifests/updated_deployment.sh $IMAGE_TAG'
            }
        }

        stage('Commit Manifest Changes') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                    git add kubernetes-manifests/*.yaml

                    if git diff --cached --quiet; then
                        echo "No manifest changes to commit."
                    else
                        git commit -m "Update manifests [skip ci]"
                        git push https://${USER}:${PASS}@github.com/vijay-saw/vijay-portfolio.git HEAD:${BRANCH_NAME}
                    fi
                    '''
                }
            }
        }
    }


post {
    success {
        echo "CI completed successfully. Triggering CD pipeline..."

        // Trigger CD pipeline (MYAPP_CD job)
        build job: 'MYAPP_CD', wait: false
    }
    failure {
        echo "CI failed. CD will not run."
    }
}



}

