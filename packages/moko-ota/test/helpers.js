export function scrollDownAStep() {
  driver.touchPerform([
    {action: 'press', options: {x: 477, y: 1624}},
    {action: 'wait', options: {ms: 100}},
    {action: 'moveTo', options: {x: 477, y: 150}},
    {action: 'release'},
  ]);
}