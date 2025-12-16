pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                bat 'docker build -t vishwak16/ai-resume-analyser:v1 .'
                bat 'docker tag vishwak16/ai-resume-analyser:v1 vishwak16/ai-resume-analyser:latest'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                    bat 'docker push vishwak16/ai-resume-analyser:v1'
                    bat 'docker push vishwak16/ai-resume-analyser:latest'
                }
            }
        }
        
        stage('Deploy with Ansible') {
            steps {
                echo 'Deploying application using Ansible...'
                bat 'wsl ansible-playbook -i /home/vishwak/ansible-projects/job-platform/inventory.ini /home/vishwak/ansible-projects/job-platform/site.yml -K'
                bat 'WSL@16'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                bat 'docker ps'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

// stage('Deploy to Kubernetes') {
//     steps {
//         echo 'Deploying to Kubernetes...'
//         bat 'minikube start'
//         bat 'kubectl set image deployment/ai-resume-analyser ai-resume-analyser=vishwak16/ai-resume-analyser:v1'
//         bat 'kubectl rollout status deployment/ai-resume-analyser'
//     }
// }
