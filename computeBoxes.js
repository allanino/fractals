// In all the functions below we model a complex number as a hash {"Re": x, "Im": y}
function squared_modulus(z) {
  return z.Re*z.Re + z.Im*z.Im;
}

// Compute one step of the iteration. Note that if z = x + iy and c = a + bi, then we have:
// z^2 + c = (x^2 - y^2 + a) + i(2xy + b)
function compute(z, c) {
  return {
    "Re": z.Re*z.Re - z.Im*z.Im + c.Re,
    "Im": 2*z.Re*z.Im + c.Im
    }
}

// Compute number of iterations until point modulus get bigger than 2 (guaranteed scape)
function computeTrajectory(c, maxSteps) {
  var trajectory = [];
  var z = {"Re": 0.0, "Im": 0.0};
  for(let steps = 0; steps <= maxSteps; steps++) {
    z = compute(z, c);
    trajectory.push(z);
    if(squared_modulus(z) > 4) {
      return trajectory;
    }
  }
  return null;
}

self.addEventListener('message', function(e) {
  let [xMin, xMax, yMin, yMax] = e.data.range;
  let xStep = e.data.stride/e.data.xScale;
  let yStep = e.data.stride/e.data.yScale;

  // Sample trajectories, incrementing boxes if trajectories escapes
  for(let i = 0; i < e.data.numSamples; i++) {
    let x = xMin + (xMax - xMin)*Math.random();
    let y = yMin + (yMax - yMin)*Math.random();
    let c = {'Re': x, 'Im': y};
    let trajectory = computeTrajectory(c, e.data.maxSteps);
    if(trajectory) {
      for(let j = 0; j < trajectory.length; j++) {
        let p = trajectory[j];
        let xi = e.data.xIndex[Math.floor(p['Re']/xStep)];
        let yi = e.data.yIndex[Math.floor(p['Im']/yStep)];
        if(e.data.boxes[xi] !== undefined && e.data.boxes[xi][yi] !== undefined) {
          e.data.boxes[xi][yi] += 1
          if(e.data.boxes[xi][yi] > e.data.max) e.data.max = e.data.boxes[xi][yi];
        };
      }
    }
  }
  self.postMessage({boxes: e.data.boxes, max: e.data.max, maxSteps: e.data.maxSteps});
}, false);
