import * as $rdf from "rdflib";

// Simple forward-chaining reasoner
// Infers:
// 1. Class membership via owl:equivalentClass
// 2. Property values via owl:equivalentProperty

export async function runReasoning(
  store: $rdf.IndexedFormula,
  ontologyStore: $rdf.IndexedFormula | null,
): Promise<void> {
  if (!ontologyStore) {
    console.warn("No ontology store provided for reasoning.");
    return;
  }

  const OWL_EQUIV_CLASS = $rdf.sym(
    "http://www.w3.org/2002/07/owl#equivalentClass",
  );
  const OWL_EQUIV_PROP = $rdf.sym(
    "http://www.w3.org/2002/07/owl#equivalentProperty",
  );
  const RDF_TYPE = $rdf.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");

  let changesMade = true;
  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (changesMade && iterations < MAX_ITERATIONS) {
    changesMade = false;
    iterations++;
    const newTriples: $rdf.Statement[] = [];
    const equivClasses = ontologyStore.statementsMatching(
      null,
      OWL_EQUIV_CLASS,
      null,
    );

    equivClasses.forEach((stmt) => {
      const class1 = stmt.subject as $rdf.NamedNode;
      const class2 = stmt.object as $rdf.NamedNode;

      // Find all instances of class1
      const instances1 = store.each(undefined, RDF_TYPE, class1) as Array<
        $rdf.NamedNode | $rdf.BlankNode
      >;

      instances1.forEach((instance) => {
        if (!store.holds(instance, RDF_TYPE, class2)) {
          newTriples.push(
            new $rdf.Statement(
              instance,
              RDF_TYPE,
              class2,
              store.sym("http://example.org/reasoner"),
            ),
          );
        }
      });

      const instances2 = store.each(undefined, RDF_TYPE, class2) as Array<
        $rdf.NamedNode | $rdf.BlankNode
      >;

      instances2.forEach((instance) => {
        if (!store.holds(instance, RDF_TYPE, class1)) {
          newTriples.push(
            new $rdf.Statement(
              instance,
              RDF_TYPE,
              class1,
              store.sym("http://example.org/reasoner"),
            ),
          );
        }
      });
    });

    const equivProps = ontologyStore.statementsMatching(
      null,
      OWL_EQUIV_PROP,
      null,
    );

    equivProps.forEach((stmt) => {
      const p1 = stmt.subject as $rdf.NamedNode;
      const p2 = stmt.object as $rdf.NamedNode;

      // Find all triples with predicate p1
      const triples1 = store.statementsMatching(null, p1, null);

      triples1.forEach((t) => {
        if (!store.holds(t.subject, p2, t.object)) {
          newTriples.push(
            new $rdf.Statement(
              t.subject,
              p2,
              t.object,
              store.sym("http://example.org/reasoner"),
            ),
          );
        }
      });

      const triples2 = store.statementsMatching(null, p2, null);

      triples2.forEach((t) => {
        if (!store.holds(t.subject, p1, t.object)) {
          newTriples.push(
            new $rdf.Statement(
              t.subject,
              p1,
              t.object,
              store.sym("http://example.org/reasoner"),
            ),
          );
        }
      });
    });

    if (newTriples.length > 0) {
      changesMade = true;
      newTriples.forEach((t) => store.add(t.subject, t.predicate, t.object));
      console.log(`[Reasoner] Inferred ${newTriples.length} new triples.`);
    }
  }
}
