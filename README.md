# Backstage Application - Setup & User Management Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Adding New Users](#adding-new-users)
3. [Authentication Configuration](#authentication-configuration)
4. [File Structure](#file-structure)
5. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- PostgreSQL database
- Docker (for TechDocs generation)

### Installation & Running

```sh
# Install dependencies
yarn install

# Start the application
yarn dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:7007

---

## Adding New Users

### For GitHub Authentication

**Step 1: Add User Entity to `examples/org.yaml`**

Location: `CloudEC-BackstagePOC-main/examples/org.yaml`

Add the following entry:

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: <github-username-lowercase>  # IMPORTANT: Must be lowercase
spec:
  profile:
    displayName: <Full Name>
    email: <email@example.com>
  memberOf: [guests]
```

**Example:**
```yaml
---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: raghavendra-vam  # GitHub username in lowercase
spec:
  profile:
    displayName: Raghavendra Lakkamaraju
    email: raghavendra.lakkamaraju@valuemomentum.com
  memberOf: [guests]
```

**CRITICAL NOTES:**
- The `metadata.name` MUST be your GitHub username in lowercase
- GitHub returns usernames in lowercase during authentication
- Even if your GitHub username is `RAGHAVENDRA-VAM`, use `raghavendra-vam` in the entity

**Step 2: Restart Backstage**

```sh
# Stop the application (Ctrl+C)
# Restart
yarn dev
```

**Step 3: Sign In**
- Go to http://localhost:3000
- Click "Sign in using Github"
- Authorize the application
- You should now be logged in

---

### For Microsoft Authentication

**Step 1: Get Azure AD Object ID**
- Go to Azure Portal → Azure Active Directory → Users
- Find your user and copy the "Object ID"

**Step 2: Add User Entity to `examples/org.yaml`**

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: <email-prefix>  # Part before @ in email
  annotations:
    microsoft.com/azure-active-directory/object-id: "<your-object-id>"
spec:
  profile:
    displayName: <Full Name>
    email: <email@example.com>
  memberOf: [backstage]
```

**Example:**
```yaml
---
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: prayanka.gochipatula
  annotations:
    microsoft.com/azure-active-directory/object-id: "0ca98645-9fc4-4a65-8164-2fa9f832ea34"
spec:
  profile:
    displayName: Prayanka Gochipatula
    email: prayanka.gochipatula@valuemomentum.net
  memberOf: [backstage]
```

**Step 3: Restart and Sign In**

---

## Authentication Configuration

### GitHub OAuth Setup

**File:** `app-config.yaml`

```yaml
auth:
  providers:
    github:
      development:
        clientId: '<your-github-oauth-client-id>'
        clientSecret: '<your-github-oauth-client-secret>'
        signIn:
          resolvers:
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: usernameMatchingUserEntityName
```

**Sign-in Resolvers Explained:**
- `emailMatchingUserEntityProfileEmail`: Matches GitHub email with User entity email
- `usernameMatchingUserEntityName`: Matches GitHub username with User entity name (lowercase)

### Microsoft OAuth Setup

**File:** `app-config.yaml`

```yaml
auth:
  providers:
    microsoft:
      development:
        clientId: '<azure-app-client-id>'
        clientSecret: '<azure-app-client-secret>'
        tenantId: '<azure-tenant-id>'
        domainHint: '<azure-tenant-id>'
        signIn:
          resolvers:
            - resolver: userIdMatchingUserEntityAnnotation
            - resolver: emailMatchingUserEntityAnnotation
            - resolver: emailMatchingUserEntityProfileEmail
            - resolver: emailLocalPartMatchingUserEntityName
```

---

## File Structure

### Key Configuration Files

```
CloudEC-BackstagePOC-main/
├── app-config.yaml                    # Main configuration file
├── app-config.production.yaml         # Production configuration
├── examples/
│   ├── org.yaml                       # User and Group entities (ADD USERS HERE)
│   └── entities.yaml                  # System, Component, API entities
├── packages/
│   └── backend/                       # Backend application
└── README.md                          # This file
```

### Where to Add What

| What to Add | File Location | Purpose |
|-------------|---------------|---------|
| New Users | `examples/org.yaml` | User authentication entities |
| New Groups | `examples/org.yaml` | Team/group definitions |
| Components/APIs | `examples/entities.yaml` | Software catalog entries |
| OAuth Credentials | `app-config.yaml` | Authentication providers |
| Database Config | `app-config.yaml` | PostgreSQL connection |
| Integration Tokens | `app-config.yaml` | GitHub, GitLab, Azure DevOps tokens |

---

## Troubleshooting

### Issue: "Failed to sign-in, unable to resolve user identity"

**Cause:** User entity name doesn't match GitHub username

**Solution:**
1. Check your exact GitHub username at https://github.com/settings/profile
2. Convert it to lowercase
3. Update `metadata.name` in `examples/org.yaml` to match
4. Restart Backstage

**Example:**
- GitHub username: `RAGHAVENDRA-VAM`
- Entity name should be: `raghavendra-vam` (lowercase)

### Issue: User entity not found after adding

**Solution:**
1. Check the catalog logs: Look for errors in the terminal
2. Verify YAML syntax: Ensure proper indentation
3. Restart the application: `yarn dev`
4. Check catalog: Go to http://localhost:3000/catalog?filters[kind]=user

### Issue: Authentication provider not working

**Solution:**
1. Verify OAuth credentials in `app-config.yaml`
2. Check callback URLs in OAuth app settings
3. Ensure resolvers are configured correctly
4. Check backend logs for authentication errors

---

## Database Configuration

**File:** `app-config.yaml`

```yaml
backend:
  database:
    client: pg
    connection:
      host: baagent.postgres.database.azure.com
      port: 5432
      user: bauser@baagent
      password: ValueMomentum123
      database: backstage_plugin_app
      ssl:
        rejectUnauthorized: false
```

---

## Integration Tokens

### GitHub Integration
**File:** `app-config.yaml` → `integrations.github`
- Used for: Repository access, catalog ingestion
- Generate at: https://github.com/settings/tokens

### Azure DevOps Integration
**File:** `app-config.yaml` → `integrations.azure`
- Used for: Repository access, catalog providers
- Generate at: Azure DevOps → User Settings → Personal Access Tokens

### GitLab Integration
**File:** `app-config.yaml` → `integrations.gitlab`
- Used for: Repository access, catalog providers
- Generate at: GitLab → User Settings → Access Tokens

---

## Quick Reference: Adding a New GitHub User

1. **Get GitHub username** (e.g., `RAGHAVENDRA-VAM`)
2. **Convert to lowercase** (e.g., `raghavendra-vam`)
3. **Edit** `examples/org.yaml`
4. **Add:**
   ```yaml
   ---
   apiVersion: backstage.io/v1alpha1
   kind: User
   metadata:
     name: raghavendra-vam
   spec:
     profile:
       displayName: Raghavendra Lakkamaraju
       email: raghavendra.lakkamaraju@valuemomentum.com
     memberOf: [guests]
   ```
5. **Restart:** `yarn dev`
6. **Sign in:** http://localhost:3000

---

## Support

For issues or questions:
- Check Backstage documentation: https://backstage.io/docs
- Review backend logs in the terminal
- Verify catalog entities at: http://localhost:3000/catalog

---

**Last Updated:** 2024
**Organization:** ValueMomentum
