const confirmations = new Set(["enviar", "sí, enviar", "confirmo envío"]);
export function isConfirmation(message: string): boolean { return confirmations.has(message.trim().toLocaleLowerCase()); }
