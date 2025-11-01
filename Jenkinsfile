pipeline {
  agent any
  options {
    timestamps()
    disableConcurrentBuilds()
  }

  // Usamos el Tool "SonarScanner" sin declarar un bloque tools{}
  // (si NO lo tenés configurado, cambiá esto por llamar directamente a `sonar-scanner` en PATH)
  environment {
    SCANNER_HOME = tool 'SonarScanner'             // nombre EXACTO del Tool en Manage Jenkins → Tools
    PATH = "${SCANNER_HOME}/bin:${env.PATH}"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
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
        withSonarQubeEnv('sonar') {                 // nombre EXACTO del server en Manage Jenkins → System
          sh '''
            echo "Ejecutando análisis en SonarQube..."
            sonar-scanner \
              -Dsonar.projectKey=jenkins-demo \
              -Dsonar.projectName=jenkins-demo \
              -Dsonar.sources=. \
              -Dsonar.host.url=$SONAR_HOST_URL
          '''
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true    // ← requerido por tu plugin
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
