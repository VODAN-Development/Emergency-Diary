# Emergency Diary: My Secure Data Place

Emergency Diary is a decentralized web application designed to help people in emergency situations securely store, manage, and selectively share sensitive personal data with trusted humanitarian organisations. The application is built on the **Solid ecosystem** and **Linked Data technologies**, ensuring that individuals remain in control of their data at all times.

Instead of storing data in centralized databases owned by institutions, Emergency Diary stores all information directly in the user’s **Solid Pod** and uses explicit, consent-based access control to enable ethical data sharing.

---

## What Is This Application About?

In humanitarian and emergency contexts, individuals such as refugees or trafficking victims are often required to repeatedly share the same sensitive information with multiple organisations. This data is usually collected through fragmented systems such as paper forms, spreadsheets, or siloed databases, leading to:

- Loss of data ownership
- Privacy and security risks
- Inconsistent or duplicated information
- Limited interoperability between organisations

Emergency Diary explores an alternative approach where:

- Individuals **own and store** their emergency data
- Access is **explicitly granted and revoked** by the data owner
- Data is structured using **RDF and Linked Data** for interoperability
- NGOs can **query distributed data** without centralizing it

The project is implemented as a **pure client-side Single Page Application (SPA)** with no backend server.
The application is currently hosted at https://emergency-diary.netlify.app

---

## Prerequisites

- **Solid Pod**: A personal online data store owned by the user
- **WebID**: A decentralized identifier used for authentication and access control
- **RDF / Linked Data**: Semantic data model used for interoperability
- **Consent-based access**: NGOs can only access data after explicit approval

---

## Technology Stack

### Frontend
- React
- TypeScript
- Vite

### Solid & Linked Data
- `@inrupt/solid-client`
- `solid-client-authn-browser`
- `rdflib`
- RDF / Turtle serialization

### Validation & Querying
- SHACL validation (`rdf-validate-shacl`)
- SPARQL querying using Comunica

### Visualization
- Chart.js

---

## Architecture Overview

- The application runs entirely in the browser
- There is **no backend server**
- All data is stored in user-owned Solid Pods
- Authentication is handled via Solid OpenID Connect
- Access control is enforced by Solid Pod ACLs
![System Architecture](images/diagram-export-12-22-2025-12_17_59-AM)
---

## Requirements

Before running the application, make sure you have:

- **Node.js** (version 22 recommended)
- **npm** (comes with Node.js)
- A **Solid Pod account**
- A **Solid WebID**

You can create a Solid Pod using providers such as:
- https://solidcommunity.net

---

## How to Set Up the Application Locally

### 1. Clone the Repository

```bash
git clone https://github.com/VODAN-Development/2025_fieldlab3.git
cd solid-emergency
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

### The application will be available at:

```bash
http://localhost:5173/
```

## Authentication and Login
- Open the application in your browser.
- Click "My Secure Data Place" to login as refugee/emergency data owner or "Support Organisation" if you are an NGO
  ### Authenticate using Solid account:
  - ### Login (if you already have an account):
    - Enter Email ID and password -> Click Login
    - Click Authorize
  - ### Create a new account
    - Click Sign Up -> Enter your Email ID and password
    - Click Register
    - Under Pods section -> if already a Pod URL is configured -> Scroll down and click Continue Authentication -> Authorize
        - ### if not:
            - Click Create Pod -> then provide name -> choose: "Use WebID in the Pod and register it to your account" option
            - Click Create Pod -> it shows your newly created Pod URL -> Click Back
            - Scroll down and click Continue Authentication -> Authorize 
Once logged in, the application establishes a secure session and gains permission to interact with your Solid Pod.

## User Roles and Usage
### Refugee / Emergency Data Owner (My Secure Data Place)
As a refugee or emergency user, you can:
 - **Create an Emergency Record**
    - Fill out structured forms describing your situation, location, and details
    - Upload supporting files if needed
- **Store Data Securely**
    - All data is validated and stored as RDF in your Solid Pod
    - No data is stored on application servers
- **Manage Access**
    - Grant read access to trusted NGOs using their WebIDs
    - Revoke access at any time
    - Access actions are logged privately in your Pod

## NGO / Humanitarian Organisation (Support Organisation)
As an NGO user, you can:
- **Authenticate Using a WebID**
- **Discover Shared Records**
    - View emergency data only after access is granted by users
- **Query Distributed Data**
    - Run SPARQL queries across multiple Pods using Comunica    
    - Analyze shared data without centralizing it
- **Visualize Results**
    - View results in lists and basic charts

## End-to-End Data Flow
- A user logs in using their Solid WebID
- Emergency data is entered through the UI
- Data is transformed into RDF using a custom vocabulary
- SHACL validation ensures data completeness
- Validated data is stored in the user’s Solid Pod
- The user grants access to selected NGOs
- NGOs query shared data across Pods using SPARQL
- Results are displayed and analyzed without copying data centrally
---
## Technical Summary
- **Purpose**: Client-side React + TypeScript SPA for securely collecting, storing, sharing, and querying emergency/refugee incident data using Solid Pods and Linked Data.
- **Stack**: React, Vite, TypeScript, rdflib, @inrupt/solid-client + solid-client-authn-browser, Comunica (@comunica/query-sparql), rdf-validate-shacl, Chart.js.
- **Auth**: Solid OIDC via auth.ts (defaults to https://solidcommunity.net), session-bound solidFetch used for authenticated requests.
- **Storage & Files**: User data is saved into their Pod under **public/emergency.ttl**; NGO list at **public/ngoList.ttl**; access logs at **private/ngo-access-log.ttl**.
- **Data model / ontology:** Uses a local CDM vocabulary in **cdm_sord.ttl** (classes: Record, Victim, Location, Situation; many hds: properties) and SHACL shapes in **shapes.ttl** for input validation.
- **Validation & Reasoning:** SHACL validation via rdf-validate-shacl (**solidDatanew.ts**) and a simple forward-chaining reasoner (owl:equivalentProperty / owl:equivalentClass) in **reasoner.ts** that augments RDF before reads/writes.
- **Data I/O:** RDF serialization with rdflib and PUT/GET to Pod URLs via the authenticated fetch. CRUD implemented in solidDatanew.ts and access control via **accessControl.ts** (uses universalAccess.setAgentAccess / setPublicAccess).
- **Search / Analytics:** SPARQL queries run with Comunica in **comunicaQuery.ts** and customizable queries in **customComunicaQuery.ts**. Queries operate across remote Pod files (sources = HTTP URLs) with the same authenticated fetch.
- **UI: App.tsx** is the main UI: bilingual (English / Tigrinya), form-driven data entry (victim, location, situation), file upload, NGO selection, access granting/revocation, basic charts (Chart.js) and lists of remote records for NGO role.
- **Access Flow**: Refugee saves RDF to their Pod; they choose NGOs (WebIDs) to grant read access; access grants are enforced via Pod ACLs (Solid universalAccess) and logged (append to private/ngo-access-log.ttl). NGOs can discover granted refugees via an index file written in NGO Pods (**public/refugeesGranted.ttl**).

## Final Presentation
Link to access slides of final presentation - [Link](https://docs.google.com/presentation/d/1QmYCiO__e2NlM8RE14cY8TLNW0KJvxN_/edit?usp=sharing&ouid=109819128229635806081&rtpof=true&sd=true)
