const inputArray = [ 
    { Phase: "Phase 1", Step: "Step 1", Task: "Task 1", Value: "5" },
    { Phase: "Phase 1", Step: "Step 1", Task: "Task 2", Value: "10" },
    { Phase: "Phase 1", Step: "Step 2", Task: "Task 1", Value: "15" },
    { Phase: "Phase 1", Step: "Step 2", Task: "Task 2", Value: "20" },
    { Phase: "Phase 2", Step: "Step 1", Task: "Task 1", Value: "25" },
    { Phase: "Phase 2", Step: "Step 1", Task: "Task 2", Value: "30" },
    { Phase: "Phase 2", Step: "Step 2", Task: "Task 1", Value: "35" },
    { Phase: "Phase 2", Step: "Step 2", Task: "Task 2", Value: "40" }
];

var outObject = inputArray.reduce(function(a, e) {
  // GROUP BY estimated key (estKey), well, may be a just plain key
  // a -- Accumulator result object
  // e -- sequentally checked Element, the Element that is tested just at this itaration

  // new grouping name may be calculated, but must be based on real value of real field
  let estKey = (e['Phase']); 

  (a[estKey] ? a[estKey] : (a[estKey] = null || [])).push(e);
  return a;
}, {});

console.log(outObject);