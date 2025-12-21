import * as $rdf from "rdflib";

const CDM_NAMESPACE = "http://example.org/hds#";
// const RDFS_NS = $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
const OWL_NS = $rdf.Namespace("http://www.w3.org/2002/07/owl#");
const RDF_NS = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");

let ontologyStore: $rdf.IndexedFormula | null = null;
let isLoaded = false;
const predicateCache: Map<string, $rdf.NamedNode> = new Map();
const classCache: Map<string, $rdf.NamedNode> = new Map();

export async function loadOntology(): Promise<void> {
  if (isLoaded) return;

  try {
    const response = await fetch("/cdm_sord.ttl");
    const ttlContent = await response.text();

    ontologyStore = $rdf.graph();
    $rdf.parse(
      ttlContent,
      ontologyStore,
      window.location.origin,
      "text/turtle",
    );

    extractOntologyTerms();
    isLoaded = true;
    console.log("Ontology loaded successfully");
  } catch (error) {
    console.error("Failed to load ontology:", error);
    throw error;
  }
}

function extractOntologyTerms(): void {
  if (!ontologyStore) return;

  const datatypePropertyType = OWL_NS("DatatypeProperty");
  const objectPropertyType = OWL_NS("ObjectProperty");
  const classType = OWL_NS("Class");

  const properties = ontologyStore
    .statementsMatching(null, RDF_NS("type"), datatypePropertyType)
    .concat(
      ontologyStore.statementsMatching(
        null,
        RDF_NS("type"),
        objectPropertyType,
      ),
    );

  properties.forEach((stmt) => {
    const propertyUri = stmt.subject.value;
    if (propertyUri.startsWith(CDM_NAMESPACE)) {
      const localName = propertyUri.substring(CDM_NAMESPACE.length);
      predicateCache.set(localName, $rdf.sym(propertyUri));
    }
  });

  const classes = ontologyStore.statementsMatching(
    null,
    RDF_NS("type"),
    classType,
  );

  classes.forEach((stmt) => {
    const classUri = stmt.subject.value;
    if (classUri.startsWith(CDM_NAMESPACE)) {
      const localName = classUri.substring(CDM_NAMESPACE.length);
      classCache.set(localName, $rdf.sym(classUri));
    }
  });

  console.log(
    `Loaded ${predicateCache.size} predicates and ${classCache.size} classes from ontology`,
  );
}

export function getOntologyStore(): $rdf.IndexedFormula | null {
  return ontologyStore;
}

export function getCDMPredicate(localName: string): $rdf.NamedNode | undefined {
  const cached = predicateCache.get(localName);
  if (cached) return cached;

  if (ontologyStore && isLoaded) {
    console.error(
      `Predicate "${localName}" not found in loaded ontology. Available predicates:`,
      Array.from(predicateCache.keys()),
    );
  }

  const uri = CDM_NAMESPACE + localName;
  const node = $rdf.sym(uri);
  return node;
}

export function getCDMClass(localName: string): $rdf.NamedNode | undefined {
  const cached = classCache.get(localName);
  if (cached) return cached;

  if (ontologyStore && isLoaded) {
    console.error(
      `Class "${localName}" not found in loaded ontology. Available classes:`,
      Array.from(classCache.keys()),
    );
  }

  const uri = CDM_NAMESPACE + localName;
  const node = $rdf.sym(uri);
  return node;
}

export const CDM = new Proxy({} as Record<string, $rdf.NamedNode>, {
  get(_target, prop: string) {
    const cached = classCache.get(prop);
    if (cached) {
      return cached;
    }

    return getCDMPredicate(prop);
  },
});

export const FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
export const SCHEMA = $rdf.Namespace("https://schema.org/");
