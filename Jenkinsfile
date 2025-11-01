pipeline {
  agent any

  tools {
    // si definiste el SonarScanner como herramienta en Jenkins (Manage Jenkins → Global Tool Configuration)
    // sonarScanner 'SonarScanner'
  }

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

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonar') {
          sh '''
            echo "Ejecutando análisis en SonarQube..."
            sonar-scanner \
              -Dsonar.projectKey=jenkins-demo \
              -Dsonar.projectName=jenkins-demo \
              -Dsonar.sources=. \
              -Dsonar.host.url=http://localhost:9000
          '''
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate()
        }
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
