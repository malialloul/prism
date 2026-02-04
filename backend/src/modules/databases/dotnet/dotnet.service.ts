// src/modules/databases/dotnet/dotnet.service.ts

import type { GeneratedFile, ApiEndpoint, ApiParameter, DatabaseInfo } from '../shared';
import type { DotNetProjectConfig } from './dotnet.types';

/**
 * Convert SQL column type to C# type
 */
function sqlTypeToCSharpType(sqlType: string): string {
  const type = sqlType.toUpperCase();
  
  if (type.includes('BIGINT') || type.includes('BIGSERIAL')) {
    return 'long';
  }
  if (type.includes('INT') || type.includes('SERIAL')) {
    return 'int';
  }
  if (type.includes('SMALLINT') || type.includes('TINYINT')) {
    return 'short';
  }
  if (type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('MONEY')) {
    return 'decimal';
  }
  if (type.includes('FLOAT') || type.includes('REAL')) {
    return 'float';
  }
  if (type.includes('DOUBLE')) {
    return 'double';
  }
  if (type.includes('BOOL')) {
    return 'bool';
  }
  if (type.includes('DATE') && !type.includes('TIME')) {
    return 'DateOnly';
  }
  if (type.includes('TIME') && !type.includes('DATE') && !type.includes('STAMP')) {
    return 'TimeOnly';
  }
  if (type.includes('TIMESTAMP') || type.includes('DATETIME')) {
    return 'DateTime';
  }
  if (type.includes('UUID') || type.includes('GUID')) {
    return 'Guid';
  }
  if (type.includes('JSON') || type.includes('JSONB')) {
    return 'object';
  }
  if (type.includes('BYTEA') || type.includes('BLOB') || type.includes('BINARY')) {
    return 'byte[]';
  }
  
  return 'string';
}

/**
 * Convert name to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert name to camelCase
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Generate .csproj file
 */
function generateCsproj(config: DotNetProjectConfig, dbInfo: DatabaseInfo): string {
  const dbPackage = dbInfo.engine === 'postgres'
    ? '<PackageReference Include="Npgsql" Version="8.0.1" />'
    : '<PackageReference Include="MySql.Data" Version="8.2.0" />';

  return `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net${config.dotnetVersion}</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>${config.namespace}</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Dapper" Version="2.1.24" />
    ${dbPackage}
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  </ItemGroup>

</Project>
`;
}

/**
 * Generate Program.cs
 */
function generateProgramCs(config: DotNetProjectConfig, apis: ApiEndpoint[]): string {
  const serviceRegistrations = apis.map(api => {
    const serviceName = toPascalCase(api.name) + 'Service';
    return `builder.Services.AddScoped<${serviceName}>();`;
  }).join('\n');

  return `using ${config.namespace}.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "${config.name}", Version = "v1" });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register services
${serviceRegistrations}

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
`;
}

/**
 * Generate appsettings.json
 */
function generateAppSettings(dbInfo: DatabaseInfo): string {
  const connectionString = dbInfo.engine === 'postgres'
    ? `Host=${dbInfo.host};Port=${dbInfo.port};Database=${dbInfo.database};Username=${dbInfo.username};Password=YOUR_PASSWORD_HERE`
    : `Server=${dbInfo.host};Port=${dbInfo.port};Database=${dbInfo.database};Uid=${dbInfo.username};Pwd=YOUR_PASSWORD_HERE`;

  return JSON.stringify({
    "Logging": {
      "LogLevel": {
        "Default": "Information",
        "Microsoft.AspNetCore": "Warning"
      }
    },
    "AllowedHosts": "*",
    "ConnectionStrings": {
      "DefaultConnection": connectionString
    }
  }, null, 2);
}

/**
 * Generate appsettings.Development.json
 */
function generateAppSettingsDev(): string {
  return JSON.stringify({
    "Logging": {
      "LogLevel": {
        "Default": "Debug",
        "Microsoft.AspNetCore": "Information"
      }
    }
  }, null, 2);
}

/**
 * Generate .gitignore
 */
function generateGitignore(): string {
  return `## .NET
bin/
obj/
*.user
*.userosscache
*.suo
*.cache
*.log

## Visual Studio
.vs/
*.sln.docstates

## JetBrains Rider
.idea/
*.sln.iml

## User-specific files
*.rsuser
*.suo
*.user
*.userosscache
*.sln.docstates

## Build results
[Dd]ebug/
[Rr]elease/
x64/
x86/

## NuGet
*.nupkg
**/packages/*
!**/packages/build/

## Secrets
appsettings.*.local.json
secrets.json

## OS
.DS_Store
Thumbs.db
`;
}

/**
 * Generate README.md
 */
function generateReadme(config: DotNetProjectConfig, apis: ApiEndpoint[], dbInfo: DatabaseInfo): string {
  const apiList = apis.map(api => {
    const controllerName = toPascalCase(api.name);
    return `- \`${api.method}\` \`/api/${controllerName}\` - ${api.description || api.name}`;
  }).join('\n');

  return `# ${config.name}

${config.description}

## Prerequisites

- .NET ${config.dotnetVersion} SDK
- ${dbInfo.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'} database

## Setup

1. Update the connection string in \`appsettings.json\` with your database credentials.

2. Run the application:
   \`\`\`bash
   dotnet run
   \`\`\`

3. Access Swagger UI at: \`https://localhost:5001/swagger\`

## API Endpoints

${apiList}

## Project Structure

\`\`\`
${config.name}/
├── Program.cs              # Application entry point
├── appsettings.json        # Configuration
├── Controllers/
│   └── *Controller.cs      # API controllers
├── Services/
│   └── *Service.cs         # Business logic
└── Models/
    └── *.cs                # Request/Response DTOs
\`\`\`

## Development

### Build
\`\`\`bash
dotnet build
\`\`\`

### Run with hot reload
\`\`\`bash
dotnet watch run
\`\`\`

### Publish for production
\`\`\`bash
dotnet publish -c Release
\`\`\`

## Generated by Prism

This project was automatically generated from your custom APIs.
`;
}

/**
 * Generate request model for an API
 */
function generateRequestModel(api: ApiEndpoint, namespace: string): string | null {
  const params = api.parameters || [];
  if (params.length === 0) return null;

  const className = toPascalCase(api.name) + 'Request';
  const properties = params.map(p => {
    const propName = toPascalCase(p.name);
    const propType = sqlTypeToCSharpType(p.columnType);
    const nullable = p.required ? '' : '?';
    return `    public ${propType}${nullable} ${propName} { get; set; }`;
  }).join('\n');

  return `namespace ${namespace}.Models;

public class ${className}
{
${properties}
}
`;
}

/**
 * Generate response model
 */
function generateResponseModel(namespace: string): string {
  return `namespace ${namespace}.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public int RowCount { get; set; }
    public string? Error { get; set; }

    public static ApiResponse<T> Ok(T data, int rowCount = 0)
    {
        return new ApiResponse<T> { Success = true, Data = data, RowCount = rowCount };
    }

    public static ApiResponse<T> Fail(string error)
    {
        return new ApiResponse<T> { Success = false, Error = error };
    }
}
`;
}

/**
 * Generate service for an API
 */
function generateService(api: ApiEndpoint, config: DotNetProjectConfig, dbInfo: DatabaseInfo): string {
  const serviceName = toPascalCase(api.name) + 'Service';
  const params = api.parameters || [];
  
  // Check if this API has pagination (pagesize and pagecount parameters)
  const hasPagination = params.some(p => p.name === 'pagesize') && params.some(p => p.name === 'pagecount');
  
  // Process SQL - replace :paramName with @ParamName for Dapper
  let processedSql = api.sql;
  params.forEach(param => {
    if (param.name === 'pagecount') return; // pagecount is used to calculate offset
    const placeholder = `:${param.name}`;
    const dapperParam = `@${toPascalCase(param.name)}`;
    processedSql = processedSql.replace(new RegExp(placeholder, 'g'), dapperParam);
  });
  
  // Handle offset placeholder (calculated from pagecount)
  if (hasPagination && processedSql.includes(':offset')) {
    processedSql = processedSql.replace(/:offset/g, '@Offset');
  }

  const methodParams = params.length > 0
    ? params.map(p => `${sqlTypeToCSharpType(p.columnType)}${p.required ? '' : '?'} ${toCamelCase(p.name)}`).join(', ')
    : '';

  // Build Dapper parameters - calculate offset from pagecount
  let dapperParams: string;
  if (params.length > 0) {
    if (hasPagination) {
      const paramMappings = params.map(p => {
        if (p.name === 'pagecount') {
          return null; // Skip pagecount, we use it to calculate offset
        }
        return `${toPascalCase(p.name)} = ${toCamelCase(p.name)}`;
      }).filter(Boolean);
      // Add calculated offset
      paramMappings.push('Offset = ((pagecount ?? 1) - 1) * (pagesize ?? 100)');
      dapperParams = `new { ${paramMappings.join(', ')} }`;
    } else {
      dapperParams = `new { ${params.map(p => `${toPascalCase(p.name)} = ${toCamelCase(p.name)}`).join(', ')} }`;
    }
  } else {
    dapperParams = 'null';
  }

  const connectionClass = dbInfo.engine === 'postgres' ? 'NpgsqlConnection' : 'MySqlConnection';
  const usingStatement = dbInfo.engine === 'postgres' ? 'using Npgsql;' : 'using MySql.Data.MySqlClient;';

  return `using Dapper;
${usingStatement}

namespace ${config.namespace}.Services;

public class ${serviceName}
{
    private readonly IConfiguration _configuration;

    public ${serviceName}(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<IEnumerable<dynamic>> ExecuteAsync(${methodParams})
    {
        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        
        using var connection = new ${connectionClass}(connectionString);
        await connection.OpenAsync();

        var sql = @"${processedSql.replace(/"/g, '""')}";
        
        var result = await connection.QueryAsync<dynamic>(sql, ${dapperParams});
        return result;
    }
}
`;
}

/**
 * Generate controller for an API
 */
function generateController(api: ApiEndpoint, config: DotNetProjectConfig): string {
  const controllerName = toPascalCase(api.name) + 'Controller';
  const serviceName = toPascalCase(api.name) + 'Service';
  const serviceVar = toCamelCase(api.name) + 'Service';
  const params = api.parameters || [];
  const method = api.method.toUpperCase();
  
  let actionMethod: string;
  let actionParams: string;
  let serviceCall: string;

  if (params.length === 0) {
    actionParams = '';
    serviceCall = `await _${serviceVar}.ExecuteAsync()`;
  } else if (method === 'GET') {
    actionParams = params.map(p => {
      const paramType = sqlTypeToCSharpType(p.columnType);
      const nullable = p.required ? '' : '?';
      return `[FromQuery] ${paramType}${nullable} ${toCamelCase(p.name)}`;
    }).join(', ');
    serviceCall = `await _${serviceVar}.ExecuteAsync(${params.map(p => toCamelCase(p.name)).join(', ')})`;
  } else {
    const requestType = toPascalCase(api.name) + 'Request';
    actionParams = `[FromBody] ${requestType} request`;
    serviceCall = `await _${serviceVar}.ExecuteAsync(${params.map(p => `request.${toPascalCase(p.name)}`).join(', ')})`;
  }

  const httpMethod = method === 'GET' ? 'HttpGet' : method === 'POST' ? 'HttpPost' : method === 'PUT' ? 'HttpPut' : method === 'DELETE' ? 'HttpDelete' : 'HttpGet';

  return `using Microsoft.AspNetCore.Mvc;
using ${config.namespace}.Models;
using ${config.namespace}.Services;

namespace ${config.namespace}.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ${controllerName} : ControllerBase
{
    private readonly ${serviceName} _${serviceVar};

    public ${controllerName}(${serviceName} ${serviceVar})
    {
        _${serviceVar} = ${serviceVar};
    }

    /// <summary>
    /// ${api.description || api.name}
    /// </summary>
    [${httpMethod}]
    public async Task<ActionResult<ApiResponse<IEnumerable<dynamic>>>> Execute(${actionParams})
    {
        try
        {
            var result = ${serviceCall};
            var resultList = result.ToList();
            return Ok(ApiResponse<IEnumerable<dynamic>>.Ok(resultList, resultList.Count));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<IEnumerable<dynamic>>.Fail(ex.Message));
        }
    }
}
`;
}

/**
 * Generate launchSettings.json
 */
function generateLaunchSettings(config: DotNetProjectConfig): string {
  return JSON.stringify({
    "$schema": "https://json.schemastore.org/launchsettings.json",
    "profiles": {
      [config.name]: {
        "commandName": "Project",
        "dotnetRunMessages": true,
        "launchBrowser": true,
        "launchUrl": "swagger",
        "applicationUrl": "https://localhost:5001;http://localhost:5000",
        "environmentVariables": {
          "ASPNETCORE_ENVIRONMENT": "Development"
        }
      }
    }
  }, null, 2);
}

/**
 * Main function to generate .NET project
 */
export function generateDotNetProject(
  config: DotNetProjectConfig,
  apis: ApiEndpoint[],
  dbInfo: DatabaseInfo
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Root files
  files.push({ path: `${config.name}.csproj`, content: generateCsproj(config, dbInfo) });
  files.push({ path: 'Program.cs', content: generateProgramCs(config, apis) });
  files.push({ path: 'appsettings.json', content: generateAppSettings(dbInfo) });
  files.push({ path: 'appsettings.Development.json', content: generateAppSettingsDev() });
  files.push({ path: '.gitignore', content: generateGitignore() });
  files.push({ path: 'README.md', content: generateReadme(config, apis, dbInfo) });
  files.push({ path: 'Properties/launchSettings.json', content: generateLaunchSettings(config) });

  // Models
  files.push({ path: 'Models/ApiResponse.cs', content: generateResponseModel(config.namespace) });

  // Generate files for each API
  apis.forEach(api => {
    const baseName = toPascalCase(api.name);
    
    // Request model (if has parameters and not GET)
    if (api.parameters && api.parameters.length > 0 && api.method.toUpperCase() !== 'GET') {
      const requestModel = generateRequestModel(api, config.namespace);
      if (requestModel) {
        files.push({ path: `Models/${baseName}Request.cs`, content: requestModel });
      }
    }

    // Service
    files.push({
      path: `Services/${baseName}Service.cs`,
      content: generateService(api, config, dbInfo)
    });

    // Controller
    files.push({
      path: `Controllers/${baseName}Controller.cs`,
      content: generateController(api, config)
    });
  });

  return files;
}
