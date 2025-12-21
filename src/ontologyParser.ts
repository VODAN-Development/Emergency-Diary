export interface OntologyMapping {
  prefixes: Record<string, string>;
  propertyMap: Record<string, string[]>;
}

export async function fetchAndParseOntology(): Promise<OntologyMapping> {
  try {
    const response = await fetch("/cdm_sord.ttl");
    const text = await response.text();
    return parseTurtle(text);
  } catch (error) {
    console.error("Error fetching ontology:", error);
    return {
      prefixes: {
        cdm: "http://example.org/hds#",
        schema: "https://schema.org/",
        owl: "http://www.w3.org/2002/07/owl#",
      },
      propertyMap: {},
    };
  }
}

function parseTurtle(ttl: string): OntologyMapping {
  const prefixes: Record<string, string> = {};
  const propertyMap: Record<string, string[]> = {};

  const lines = ttl.split("\n");
  let currentSubject = "";

  const prefixRegex = /@prefix\s+(\w+):\s+<([^>]+)>/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const prefixMatch = line.match(prefixRegex);
    if (prefixMatch) {
      prefixes[prefixMatch[1]] = prefixMatch[2];
      continue;
    }

    if (
      line.startsWith("hds:") &&
      (line.includes("owl:DatatypeProperty") ||
        line.includes("owl:ObjectProperty"))
    ) {
      currentSubject = line.split(" ")[0];
      if (!propertyMap[currentSubject]) {
        propertyMap[currentSubject] = [currentSubject];
      }
    }

    if (currentSubject && line.includes("owl:equivalentProperty")) {
      const parts = line.split(/\s+/);
      const equivIndex = parts.indexOf("owl:equivalentProperty");
      if (equivIndex !== -1) {
        for (let i = equivIndex + 1; i < parts.length; i++) {
          let object = parts[i];
          const isEnd = object.includes(";") || object.includes(".");
          object = object.replace(/[;,.]/g, "");

          if (object && !propertyMap[currentSubject].includes(object)) {
            propertyMap[currentSubject].push(object);
          }

          if (isEnd) break;
        }
      }
    }

    if (line.endsWith(".") && !line.startsWith("@prefix")) {
      currentSubject = "";
    }
  }

  return { prefixes, propertyMap };
}

export function generateSparqlPrefixes(
  prefixes: Record<string, string>,
): string {
  return Object.entries(prefixes)
    .map(([key, url]) => `PREFIX ${key}: <${url}>`)
    .join("\n");
}

export function expandProperty(
  property: string,
  mapping: OntologyMapping,
): string {
  const equivalents = mapping.propertyMap[property];
  if (!equivalents || equivalents.length === 0) {
    return property;
  }
  return equivalents.join("|");
}
