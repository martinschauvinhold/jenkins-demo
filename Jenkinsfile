pipeline {
  agent any
  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    SCANNER_HOME = tool 'SonarScanner'
    PATH = "${SCANNER_HOME}/bin:${env.PATH}"
  }

  stages {

    // -------------------------------
    // 1. CHECKOUT
    // -------------------------------
    stage('Checkout') {
      steps { checkout scm }
    }

    // -------------------------------
    // 2. BUILD
    // -------------------------------
    stage('Build') {
      steps {
        sh 'echo "Compilando proyecto..."'
      }
    }

    // -------------------------------
    // 3. TESTS
    // -------------------------------
    stage('Test') {
      steps {
        sh 'echo "Ejecutando tests..."'
      }
    }

    // -------------------------------
    // 4. SONARQUBE
    // -------------------------------
    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonar') {
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

    // -------------------------------
    // 5. QUALITY GATE
    // -------------------------------
    stage('Quality Gate') {
      steps {
        timeout(time: 10, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    // -------------------------------
    // 6. SAST — SEMGREP
    // -------------------------------
    stage('SAST - Semgrep') {
      steps {
        sh '''
          echo "Ejecutando Semgrep (SAST)..."
          export PATH="$PATH:/home/ubuntu/.local/bin"

          mkdir -p reports

          semgrep --config=auto \
                  --json \
                  --output=reports/semgrep-report.json \
                  || true
        '''
      }
      post {
        always {
          script {
            if (fileExists('reports/semgrep-report.json')) {
              archiveArtifacts artifacts: 'reports/semgrep-report.json', onlyIfSuccessful: false
            } else {
              echo '⚠ Semgrep no generó reports/semgrep-report.json (revisar stage SAST).'
            }
          }
        }
      }
    }

    // -------------------------------
    // 7. SCA — SNYK
    // -------------------------------
        stage('SCA - Snyk') {
      steps {
        withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
          sh '''
            echo "Ejecutando Snyk (SCA)..."
            mkdir -p reports
            export SNYK_TOKEN=${SNYK_TOKEN}

            # Ejecutamos Snyk y guardamos el resultado en JSON
            snyk test --json > reports/snyk-report.json || true
          '''
        }
      }
      post {
        always {
          script {
            if (fileExists('reports/snyk-report.json')) {
              archiveArtifacts artifacts: 'reports/snyk-report.json', onlyIfSuccessful: false
            } else {
              echo '⚠ Snyk no generó reports/snyk-report.json (revisar stage SCA).'
            }
          }
        }
      }
    }


    // -------------------------------
    // 8. PACKAGE
    // -------------------------------
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

