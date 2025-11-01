pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build') {
      steps {
        sh 'echo "Compilando proyecto..."'
      }
    }
    stage('Test') {
      steps {
        sh 'echo "Ejecutando tests..."'
      }
    }
    stage('Package') {
      steps {
        sh 'mkdir -p build && echo "artefacto-demo" > build/artifact.txt'
        archiveArtifacts artifacts: 'build/**', fingerprint: true
      }
    }
  }
  post {
    success { echo '✅ Pipeline completado con éxito' }
    failure { echo '❌ Pipeline falló' }
  }
}
pipeline {
  agent any

  stages {
    stage('Build') {
      steps {
        sh 'echo Compilando proyecto...'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonar') {
          sh 'echo "Ejecutando análisis en SonarQube..."'
          sh 'sonar-scanner -Dsonar.projectKey=jenkins-demo -Dsonar.sources=.'
        }
      }
    }
  }

  post {
    success {
      echo '✅ Pipeline completado con éxito'
    }
    failure {
      echo '❌ Pipeline falló'
    }
  }
}
