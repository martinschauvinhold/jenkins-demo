/*
  Jenkinsfile - Demo Pipeline DevSecOps
  -------------------------------------
  Este pipeline muestra un flujo completo de CI/CD con foco en DevSecOps:

  1) Checkout del código desde Git
  2) Build (compilación)
  3) Tests
  4) Análisis estático con SonarQube (bugs, code smells, coverage, etc.)
  5) Quality Gate de SonarQube (frena o no el pipeline)
  6) SAST con Semgrep (vulnerabilidades en el código)
  7) SCA con Snyk (vulnerabilidades en dependencias)
  8) DAST con OWASP ZAP (escaneo dinámico de una app web de prueba)
  9) Package (artefacto final de demo)

  Requisitos:
   - Jenkins con plugin de Pipeline, SonarQube y credenciales configuradas.
   - Herramientas instaladas en el agente:
       * SonarScanner (configurado en "Global Tool Configuration" como 'SonarScanner')
       * Semgrep instalado (ej: pipx/pip en /home/ubuntu/.local/bin)
       * Snyk CLI instalado
       * Docker instalado y funcionando (para el stage de ZAP)
   - Credenciales:
       * Servidor SonarQube configurado como 'sonar'
       * Credential de tipo "Secret text" con ID 'snyk-token'
*/

pipeline {
  agent any

  options {
    // Muestra timestamps en el log de Jenkins
    timestamps()
    // Evita que se ejecuten builds en paralelo del mismo job
    disableConcurrentBuilds()
  }

  environment {
    // Herramienta SonarScanner configurada en Jenkins (Manage Jenkins > Global Tool Configuration)
    SCANNER_HOME = tool 'SonarScanner'

    // Agrego SonarScanner al PATH para poder usar 'sonar-scanner' directamente
    PATH = "${SCANNER_HOME}/bin:${PATH}"
  }

  stages {

    // -------------------------------
    // 1. CHECKOUT
    // -------------------------------
    stage('Checkout') {
      steps {
        // Toma el Jenkinsfile y el código del mismo repo configurado en el job
        checkout scm
      }
    }

    // -------------------------------
    // 2. BUILD
    // -------------------------------
    stage('Build') {
      steps {
        // Acá irían los comandos reales de build (npm install / mvn package / etc.)
        // Ejemplo para Node:
        // sh 'npm install'
        sh 'echo "Compilando proyecto (demo de build)..."'
      }
    }

    // -------------------------------
    // 3. TESTS
    // -------------------------------
    stage('Test') {
      steps {
        // Acá irían los tests reales (npm test / mvn test / etc.)
        // Ejemplo para Node:
        // sh 'npm test'
        sh 'echo "Ejecutando tests (demo de tests)..."'
      }
    }

    // -------------------------------
    // 4. SONARQUBE
    // -------------------------------
    stage('SonarQube Analysis') {
      steps {
        // 'sonar' es el nombre del servidor SonarQube configurado en Jenkins (Manage Jenkins > Configure System)
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
        // Espera a que SonarQube procese el análisis
        // Si el Quality Gate se marca como FAILED, aborta el pipeline
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

          # Aseguramos que Semgrep (instalado con pip/pipx) esté en el PATH
          export PATH="$PATH:/home/ubuntu/.local/bin"

          mkdir -p reports

          # --config=auto: usa reglas por defecto según el stack detectado
          # --json: salida en JSON para poder archivarla
          semgrep --config=auto \
                  --json \
                  --output=reports/semgrep-report.json \
                  || true   # '|| true' para que, en modo demo, el pipeline no falle si hay findings
        '''
      }
      post {
        always {
          script {
            if (fileExists('reports/semgrep-report.json')) {
              // Publicamos el reporte como artefacto del build
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
        // Usa credencial 'snyk-token' almacenada en Jenkins (Secret text)
        withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN')]) {
          sh '''
            echo "Ejecutando Snyk (SCA - dependencias)..."

            mkdir -p reports
            export SNYK_TOKEN=${SNYK_TOKEN}

            # Analiza vulnerabilidades en dependencias (package.json, pom.xml, etc.)
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
    // 8. DAST — OWASP ZAP
    // -------------------------------
    stage('DAST - OWASP ZAP') {
      steps {
        sh '''
          echo "Ejecutando OWASP ZAP (DAST) contra testphp.vulnweb.com..."

          # Carpeta para el reporte de ZAP
          mkdir -p reports/zap

          # Escaneo full con la imagen oficial de ZAP
          # IMPORTANTE: requiere Docker instalado en el agente Jenkins.
          docker run --rm \
            -v $(pwd)/reports/zap:/zap/wrk/ \
            owasp/zap2docker-stable \
              zap-full-scan.py \
                -t http://testphp.vulnweb.com/ \
                -r zap-report.html \
              || true   # en modo demo dejamos que el pipeline siga aunque detecte alertas
        '''
      }
      post {
        always {
          script {
            if (fileExists('reports/zap/zap-report.html')) {
              archiveArtifacts artifacts: 'reports/zap/zap-report.html', onlyIfSuccessful: false
            } else {
              echo '⚠ ZAP no generó reports/zap/zap-report.html (revisar stage DAST).'
            }
          }
        }
      }
    }

    // -------------------------------
    // 9. PACKAGE
    // -------------------------------
    stage('Package') {
      steps {
        // Stage simple para simular la generación de un artefacto final
        sh '''
          echo "Generando artefacto de demo..."
          mkdir -p build
          echo "artefacto-demo" > build/artifact.txt
        '''
        archiveArtifacts artifacts: 'build/**', fingerprint: true
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
