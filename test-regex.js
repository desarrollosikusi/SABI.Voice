const value = '8999990681';
const digits = String(value).replace(/\D/g, '');
const dv = digits.slice(-1);
const body = digits.slice(0, -1);
const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
console.log(`${formattedBody}-${dv}`);
