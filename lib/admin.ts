export function isSurveyOwner(headers:Headers,ownerEmail:string|undefined):boolean{
  const email=headers.get('oai-authenticated-user-email');
  const id=headers.get('oai-authenticated-user-id');
  return !!ownerEmail && !!id && !!email && email.trim().toLowerCase()===ownerEmail.trim().toLowerCase();
}
