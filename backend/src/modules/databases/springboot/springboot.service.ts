// src/modules/databases/springboot/springboot.service.ts

import archiver from 'archiver';
import { Writable } from 'stream';
import type {
  SpringBootProjectConfig,
  GeneratedFile,
  ApiEndpoint,
  ApiParameter,
  DatabaseInfo,
} from './springboot.types';

/**
 * Convert SQL column type to Java type
 */
function sqlTypeToJavaType(sqlType: string): string {
  const type = sqlType.toUpperCase();
  
  if (type.includes('INT') || type.includes('SERIAL')) {
    if (type.includes('BIG')) return 'Long';
    if (type.includes('SMALL') || type.includes('TINY')) return 'Integer';
    return 'Integer';
  }
  if (type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('MONEY')) {
    return 'BigDecimal';
  }
  if (type.includes('FLOAT') || type.includes('REAL')) {
    return 'Float';
  }
  if (type.includes('DOUBLE')) {
    return 'Double';
  }
  if (type.includes('BOOL')) {
    return 'Boolean';
  }
  if (type.includes('DATE') && !type.includes('TIME')) {
    return 'LocalDate';
  }
  if (type.includes('TIME') && !type.includes('DATE') && !type.includes('STAMP')) {
    return 'LocalTime';
  }
  if (type.includes('TIMESTAMP') || type.includes('DATETIME')) {
    return 'LocalDateTime';
  }
  if (type.includes('UUID')) {
    return 'UUID';
  }
  if (type.includes('JSON') || type.includes('JSONB')) {
    return 'String'; // Or could use JsonNode
  }
  if (type.includes('BYTEA') || type.includes('BLOB') || type.includes('BINARY')) {
    return 'byte[]';
  }
  
  return 'String';
}

/**
 * Convert parameter name to Java camelCase
 */
function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[_-](.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert name to PascalCase for class names
 */
function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Sanitize endpoint name for use as class name
 */
function sanitizeClassName(name: string): string {
  // Remove special characters and convert to PascalCase
  return name
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Generate pom.xml
 */
function generatePomXml(config: SpringBootProjectConfig, dbInfo: DatabaseInfo): string {
  const dbDependency = dbInfo.engine === 'postgres'
    ? `<dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>`
    : `<dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>${config.springBootVersion}</version>
        <relativePath/>
    </parent>
    
    <groupId>${config.groupId}</groupId>
    <artifactId>${config.artifactId}</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>${config.name}</name>
    <description>${config.description}</description>
    
    <properties>
        <java.version>${config.javaVersion}</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        
        ${dbDependency}
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
`;
}

/**
 * Generate Application.java (main class)
 */
function generateApplicationClass(config: SpringBootProjectConfig): string {
  const className = toPascalCase(config.artifactId.replace(/-/g, ' ')) + 'Application';
  
  return `package ${config.packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className} {

    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}
`;
}

/**
 * Generate application.properties
 */
function generateApplicationProperties(dbInfo: DatabaseInfo, config: SpringBootProjectConfig): string {
  const jdbcUrl = dbInfo.engine === 'postgres'
    ? `jdbc:postgresql://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}`
    : `jdbc:mysql://${dbInfo.host}:${dbInfo.port}/${dbInfo.database}?useSSL=false&serverTimezone=UTC`;
  
  const driverClass = dbInfo.engine === 'postgres'
    ? 'org.postgresql.Driver'
    : 'com.mysql.cj.jdbc.Driver';

  return `# Application Configuration
spring.application.name=${config.name}
server.port=8080

# Database Configuration
spring.datasource.url=${jdbcUrl}
spring.datasource.username=${dbInfo.username}
spring.datasource.password=YOUR_PASSWORD_HERE
spring.datasource.driver-class-name=${driverClass}

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000

# Logging
logging.level.root=INFO
logging.level.${config.packageName}=DEBUG
`;
}

/**
 * Generate DTO class for an API endpoint
 */
function generateRequestDto(api: ApiEndpoint, packageName: string): string | null {
  if (!api.parameters || api.parameters.length === 0) {
    return null;
  }

  const className = sanitizeClassName(api.name) + 'Request';
  const fields = api.parameters.map(param => {
    const javaType = sqlTypeToJavaType(param.columnType);
    const fieldName = toCamelCase(param.name);
    const required = param.required ? '@NotNull' : '';
    return `    ${required ? required + '\n    ' : ''}private ${javaType} ${fieldName};`;
  }).join('\n\n');

  const imports = new Set<string>();
  imports.add('import lombok.Data;');
  
  api.parameters.forEach(param => {
    const javaType = sqlTypeToJavaType(param.columnType);
    if (javaType === 'BigDecimal') imports.add('import java.math.BigDecimal;');
    if (javaType === 'LocalDate') imports.add('import java.time.LocalDate;');
    if (javaType === 'LocalTime') imports.add('import java.time.LocalTime;');
    if (javaType === 'LocalDateTime') imports.add('import java.time.LocalDateTime;');
    if (javaType === 'UUID') imports.add('import java.util.UUID;');
    if (param.required) imports.add('import jakarta.validation.constraints.NotNull;');
  });

  return `package ${packageName}.dto;

${Array.from(imports).sort().join('\n')}

@Data
public class ${className} {

${fields}
}
`;
}

/**
 * Generate API Response wrapper class
 */
function generateApiResponse(packageName: string): string {
  return `package ${packageName}.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Integer rowCount;
    private Long executionTimeMs;

    public static <T> ApiResponse<T> success(T data, int rowCount, long executionTimeMs) {
        return new ApiResponse<>(true, "Query executed successfully", data, rowCount, executionTimeMs);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, null, null);
    }
}
`;
}

/**
 * Generate Service class for an API endpoint
 */
function generateServiceClass(api: ApiEndpoint, packageName: string): string {
  const className = sanitizeClassName(api.name) + 'Service';
  const hasParams = api.parameters && api.parameters.length > 0;
  
  // Build the SQL with parameter placeholders
  let sql = api.sql.trim();
  const paramMappings: { name: string; javaType: string }[] = [];
  
  if (hasParams && api.parameters) {
    api.parameters.forEach((param, index) => {
      paramMappings.push({
        name: toCamelCase(param.name),
        javaType: sqlTypeToJavaType(param.columnType),
      });
    });
  }

  // Determine if it's a SELECT or modification query
  const isSelect = sql.toUpperCase().trimStart().startsWith('SELECT');
  
  const imports = new Set<string>();
  imports.add('import org.springframework.jdbc.core.JdbcTemplate;');
  imports.add('import org.springframework.stereotype.Service;');
  imports.add('import lombok.RequiredArgsConstructor;');
  imports.add('import java.util.List;');
  imports.add('import java.util.Map;');
  
  if (hasParams) {
    api.parameters?.forEach(param => {
      const javaType = sqlTypeToJavaType(param.columnType);
      if (javaType === 'BigDecimal') imports.add('import java.math.BigDecimal;');
      if (javaType === 'LocalDate') imports.add('import java.time.LocalDate;');
      if (javaType === 'LocalTime') imports.add('import java.time.LocalTime;');
      if (javaType === 'LocalDateTime') imports.add('import java.time.LocalDateTime;');
      if (javaType === 'UUID') imports.add('import java.util.UUID;');
    });
  }

  const methodParams = hasParams && api.parameters
    ? api.parameters.map(p => `${sqlTypeToJavaType(p.columnType)} ${toCamelCase(p.name)}`).join(', ')
    : '';
  
  const queryArgs = hasParams && api.parameters
    ? ', ' + api.parameters.map(p => toCamelCase(p.name)).join(', ')
    : '';

  const methodBody = isSelect
    ? `        String sql = """
            ${sql.replace(/"/g, '\\"')}
            """;
        
        return jdbcTemplate.queryForList(sql${queryArgs});`
    : `        String sql = """
            ${sql.replace(/"/g, '\\"')}
            """;
        
        return jdbcTemplate.update(sql${queryArgs});`;

  const returnType = isSelect ? 'List<Map<String, Object>>' : 'int';

  return `package ${packageName}.service;

${Array.from(imports).sort().join('\n')}

@Service
@RequiredArgsConstructor
public class ${className} {

    private final JdbcTemplate jdbcTemplate;

    public ${returnType} execute(${methodParams}) {
${methodBody}
    }
}
`;
}

/**
 * Generate Controller class for an API endpoint
 */
function generateControllerClass(api: ApiEndpoint, packageName: string): string {
  const baseName = sanitizeClassName(api.name);
  const className = baseName + 'Controller';
  const serviceName = baseName + 'Service';
  const serviceVar = toCamelCase(serviceName);
  const hasParams = api.parameters && api.parameters.length > 0;
  const requestDtoName = baseName + 'Request';
  
  // Extract the endpoint path
  const endpointPath = api.endpoint.split('/custom-api/')[1] || api.name.toLowerCase().replace(/\s+/g, '-');
  
  const isSelect = api.sql.toUpperCase().trimStart().startsWith('SELECT');
  const httpMethod = api.method.toUpperCase();
  
  const imports = new Set<string>();
  imports.add('import org.springframework.http.ResponseEntity;');
  imports.add('import org.springframework.web.bind.annotation.*;');
  imports.add('import lombok.RequiredArgsConstructor;');
  imports.add(`import ${packageName}.service.${serviceName};`);
  imports.add(`import ${packageName}.dto.ApiResponse;`);
  
  if (hasParams) {
    imports.add(`import ${packageName}.dto.${requestDtoName};`);
    if (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH') {
      imports.add('import jakarta.validation.Valid;');
    }
  }
  
  imports.add('import java.util.List;');
  imports.add('import java.util.Map;');

  let methodAnnotation = '@GetMapping';
  let methodParams = '';
  let serviceCallArgs = '';
  
  if (hasParams && api.parameters) {
    if (httpMethod === 'GET') {
      methodParams = api.parameters.map(p => {
        const javaType = sqlTypeToJavaType(p.columnType);
        const paramName = toCamelCase(p.name);
        const required = p.required ? 'true' : 'false';
        return `@RequestParam(required = ${required}) ${javaType} ${paramName}`;
      }).join(', ');
      serviceCallArgs = api.parameters.map(p => toCamelCase(p.name)).join(', ');
      
      // Add type imports
      api.parameters.forEach(param => {
        const javaType = sqlTypeToJavaType(param.columnType);
        if (javaType === 'BigDecimal') imports.add('import java.math.BigDecimal;');
        if (javaType === 'LocalDate') imports.add('import java.time.LocalDate;');
        if (javaType === 'LocalTime') imports.add('import java.time.LocalTime;');
        if (javaType === 'LocalDateTime') imports.add('import java.time.LocalDateTime;');
        if (javaType === 'UUID') imports.add('import java.util.UUID;');
      });
    } else {
      methodParams = `@Valid @RequestBody ${requestDtoName} request`;
      serviceCallArgs = api.parameters.map(p => `request.get${toPascalCase(p.name)}()`).join(', ');
    }
  }

  switch (httpMethod) {
    case 'POST':
      methodAnnotation = '@PostMapping';
      break;
    case 'PUT':
      methodAnnotation = '@PutMapping';
      break;
    case 'PATCH':
      methodAnnotation = '@PatchMapping';
      break;
    case 'DELETE':
      methodAnnotation = '@DeleteMapping';
      break;
    default:
      methodAnnotation = '@GetMapping';
  }

  const responseBody = isSelect
    ? `        long startTime = System.currentTimeMillis();
        List<Map<String, Object>> result = ${serviceVar}.execute(${serviceCallArgs});
        long executionTime = System.currentTimeMillis() - startTime;
        
        return ResponseEntity.ok(ApiResponse.success(result, result.size(), executionTime));`
    : `        long startTime = System.currentTimeMillis();
        int affectedRows = ${serviceVar}.execute(${serviceCallArgs});
        long executionTime = System.currentTimeMillis() - startTime;
        
        return ResponseEntity.ok(ApiResponse.success(affectedRows, affectedRows, executionTime));`;

  return `package ${packageName}.controller;

${Array.from(imports).sort().join('\n')}

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ${className} {

    private final ${serviceName} ${serviceVar};

    /**
     * ${api.description || api.name}
     */
    ${methodAnnotation}("/${endpointPath}")
    public ResponseEntity<ApiResponse<?>> execute(${methodParams}) {
${responseBody}
    }
}
`;
}

/**
 * Generate GlobalExceptionHandler
 */
function generateExceptionHandler(packageName: string): string {
  return `package ${packageName}.exception;

import ${packageName}.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataAccessException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<?>> handleDatabaseException(DataAccessException e) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Database error: " + e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .reduce((a, b) -> a + ", " + b)
            .orElse("Validation failed");
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception e) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("An error occurred: " + e.getMessage()));
    }
}
`;
}

/**
 * Generate README.md
 */
function generateReadme(config: SpringBootProjectConfig, apis: ApiEndpoint[], dbInfo: DatabaseInfo): string {
  const apiDocs = apis.map(api => {
    const params = api.parameters && api.parameters.length > 0
      ? `\n**Parameters:**\n${api.parameters.map(p => `- \`${p.name}\` (${p.columnType})${p.required ? ' - Required' : ''}`).join('\n')}`
      : '';
    
    const endpoint = api.endpoint.split('/custom-api/')[1] || api.name.toLowerCase().replace(/\s+/g, '-');
    
    return `### ${api.name}

- **Endpoint:** \`${api.method.toUpperCase()} /api/${endpoint}\`
- **Description:** ${api.description || 'No description'}
${params}
`;
  }).join('\n');

  return `# ${config.name}

${config.description}

## Prerequisites

- Java ${config.javaVersion}+
- Maven 3.6+
- ${dbInfo.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'} database

## Configuration

1. Update the database credentials in \`src/main/resources/application.properties\`:
   - \`spring.datasource.username\` - Your database username
   - \`spring.datasource.password\` - Your database password
   - \`spring.datasource.url\` - Your database URL (if different from default)

## Running the Application

\`\`\`bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
\`\`\`

The application will start on \`http://localhost:8080\`

## API Endpoints

${apiDocs}

## Project Structure

\`\`\`
src/main/java/${config.packageName.replace(/\./g, '/')}
├── ${toPascalCase(config.artifactId.replace(/-/g, ' '))}Application.java  # Main application class
├── controller/                    # REST controllers
├── service/                       # Business logic
├── dto/                          # Data transfer objects
└── exception/                    # Exception handling
\`\`\`

## Built With

- Spring Boot ${config.springBootVersion}
- Spring JDBC
- Lombok
- ${dbInfo.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'} Driver

## Generated by Prism

This project was auto-generated from custom APIs defined in Prism.
`;
}

/**
 * Generate .gitignore
 */
function generateGitignore(): string {
  return `# Compiled class files
*.class

# Log files
*.log

# Package files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# IDE
.idea/
*.iws
*.iml
*.ipr
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Spring Boot
application-local.properties
application-local.yml
`;
}

/**
 * Generate all files for the Spring Boot project
 */
export function generateSpringBootProject(
  config: SpringBootProjectConfig,
  apis: ApiEndpoint[],
  dbInfo: DatabaseInfo
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const basePath = config.packageName.replace(/\./g, '/');
  const srcPath = `src/main/java/${basePath}`;
  const resourcesPath = 'src/main/resources';

  // Root files
  files.push({ path: 'pom.xml', content: generatePomXml(config, dbInfo) });
  files.push({ path: 'README.md', content: generateReadme(config, apis, dbInfo) });
  files.push({ path: '.gitignore', content: generateGitignore() });

  // Main application class
  files.push({
    path: `${srcPath}/${toPascalCase(config.artifactId.replace(/-/g, ' '))}Application.java`,
    content: generateApplicationClass(config),
  });

  // Application properties
  files.push({
    path: `${resourcesPath}/application.properties`,
    content: generateApplicationProperties(dbInfo, config),
  });

  // Common DTOs
  files.push({
    path: `${srcPath}/dto/ApiResponse.java`,
    content: generateApiResponse(config.packageName),
  });

  // Exception handler
  files.push({
    path: `${srcPath}/exception/GlobalExceptionHandler.java`,
    content: generateExceptionHandler(config.packageName),
  });

  // Generate files for each API
  apis.forEach(api => {
    const baseName = sanitizeClassName(api.name);
    
    // Controller
    files.push({
      path: `${srcPath}/controller/${baseName}Controller.java`,
      content: generateControllerClass(api, config.packageName),
    });
    
    // Service
    files.push({
      path: `${srcPath}/service/${baseName}Service.java`,
      content: generateServiceClass(api, config.packageName),
    });
    
    // Request DTO (if has parameters and not GET)
    const method = api.method.toUpperCase();
    if (api.parameters && api.parameters.length > 0 && method !== 'GET') {
      const requestDto = generateRequestDto(api, config.packageName);
      if (requestDto) {
        files.push({
          path: `${srcPath}/dto/${baseName}Request.java`,
          content: requestDto,
        });
      }
    }
  });

  return files;
}

/**
 * Create a ZIP buffer from generated files
 */
export async function createZipBuffer(files: GeneratedFile[], projectName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });
    
    writableStream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });
    
    archive.on('error', (err) => {
      reject(err);
    });
    
    archive.pipe(writableStream);
    
    // Add all files to the archive
    files.forEach(file => {
      archive.append(file.content, { name: `${projectName}/${file.path}` });
    });
    
    archive.finalize();
  });
}
