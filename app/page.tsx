'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

type DocumentRecord = { id: string; filename: string; page_count: number; status: string; pages: Array<{ pageNumber: number; text: string }> };

export default function Home() {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [restoreCode, setRestoreCode] = useState('');
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function loadDocuments(id: string) {
    const response = await fetch(`/api/documents?workspaceId=${encodeURIComponent(id)}`);
    if (response.ok) setDocuments((await response.json()).documents ?? []);
  }

  useEffect(() => { if (workspace) void loadDocuments(workspace); }, [workspace]);

  async function createWorkspace() {
    setBusy(true); setMessage('CrÃ©ation de votre espaceâ€¦');
    try {
      const response = await fetch('/api/workspaces', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Impossible de crÃ©er lâ€™espace.');
      setWorkspace(data.workspaceId); setRecovery(data.recoveryCode);
      setMessage('Votre espace est prÃªt. Ajoutez maintenant votre premier cours.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.'); }
    finally { setBusy(false); }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []); event.target.value = '';
    if (!workspace || !files.length) return;
    setBusy(true); setMessage('Enregistrement et analyse des documentsâ€¦');
    const form = new FormData(); form.set('workspaceId', workspace); files.forEach((file) => form.append('files', file));
    try {
      const response = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Ã‰chec de lâ€™import.');
      await loadDocuments(workspace); setMessage(`${data.pages ?? files.length} page(s) importÃ©e(s). Consultez vos cours ci-dessous.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Ã‰chec de lâ€™import.'); }
    finally { setBusy(false); }
  }

  async function restore() {
    if (!restoreCode.trim()) { setMessage('Saisissez votre code de rÃ©cupÃ©ration.'); return; }
    setBusy(true); setMessage('Restauration de votre espaceâ€¦');
    try {
      const response = await fetch('/api/workspaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recoveryCode: restoreCode.trim() }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Code de rÃ©cupÃ©ration invalide.');
      setWorkspace(data.workspaceId); setRecovery(restoreCode.trim().toUpperCase()); setMessage('Espace restaurÃ©. Vos documents sont de nouveau accessibles.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Restauration impossible.'); }
    finally { setBusy(false); }
  }

  async function askTutor(event: FormEvent) {
    event.preventDefault(); if (!workspace || !question.trim()) return;
    setBusy(true); setAnswer(''); setMessage('Tutor.ai prÃ©pare une rÃ©ponse Ã  partir de vos coursâ€¦');
    try {
      const response = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: workspace, question }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Le tuteur est indisponible.');
      setAnswer(data.answer); setMessage('RÃ©ponse basÃ©e sur votre bibliothÃ¨que.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Le tuteur est indisponible.'); }
    finally { setBusy(false); }
  }

  function copyRecovery() { if (recovery) navigator.clipboard?.writeText(recovery); setMessage('Code copiÃ©. Gardez-le dans un endroit sÃ»r.'); }
  const statusLabel = (status: string) => ({ ocr_complete: 'Texte extrait', ocr_pending: 'OCR en attente', ocr_not_configured: 'Clé OCR manquante', ocr_error: 'OCR Ã  relancer', uploaded: 'ImportÃ©' }[status] ?? status);

  return <main className="shell">
    <header className="topbar"><div className="brand">tutor<span>.ai</span></div><div className="badge">Cameroun Â· FranÃ§ais</div></header>
    <section className="hero">
      <div className="eyebrow">Votre espace de rÃ©vision personnel</div>
      <h1>Comprenez mieux.<br /><em>RÃ©visez avec mÃ©thode.</em></h1>
      <p className="lead">Importez vos notes ou vos anciens sujets. Tutor.ai les transforme en explications claires et en exercices adaptÃ©s Ã  votre niveau.</p>
      {!workspace ? <div className="start-card">
        <div className="step-number">1</div><div className="start-copy"><h2>CrÃ©ez votre espace</h2><p>Sans inscription. Vos documents restent liÃ©s Ã  un code de rÃ©cupÃ©ration.</p></div>
        <button className="primary" onClick={createWorkspace} disabled={busy}>{busy ? 'PrÃ©parationâ€¦' : 'Commencer maintenant'} <span>â†’</span></button>
        <div className="restore"><span>Vous avez dÃ©jÃ  un espace ?</span><input aria-label="Code de rÃ©cupÃ©ration" placeholder="Code de rÃ©cupÃ©ration" value={restoreCode} onChange={(e) => setRestoreCode(e.target.value)} /><button className="link-button" onClick={restore} disabled={busy}>Restaurer</button></div>
      </div> : <div className="workspace-card">
        <div className="workspace-head"><div><div className="active"><span className="success-dot" /> Espace actif</div><h2>Ajoutez votre premier cours</h2><p>Images, photos prises avec votre tÃ©lÃ©phone ou PDF scannÃ©s.</p></div><button className="small-button" onClick={copyRecovery}>Copier mon code</button></div>
        <div className="upload-grid"><label className="upload-option primary-option"><input type="file" accept="image/*,application/pdf" multiple onChange={upload} disabled={busy} /><span className="upload-icon">â†‘</span><strong>Importer des fichiers</strong><small>PDF ou images Â· 10 pages max</small></label><label className="upload-option"><input type="file" accept="image/*" capture="environment" multiple onChange={upload} disabled={busy} /><span className="camera-icon">âŒ¾</span><strong>Prendre des photos</strong><small>Utiliser la camÃ©ra du tÃ©lÃ©phone</small></label></div>
        {recovery && <div className="recovery"><span>Votre code de rÃ©cupÃ©ration</span><code>{recovery}</code><button onClick={copyRecovery}>Copier</button></div>}
      </div>}
      {message && <p className="status" role="status">{message}</p>}
    </section>
    {workspace && <section className="dashboard">
      <div className="section-heading"><div><div className="section-label">VOTRE BIBLIOTHÃˆQUE</div><h2>Vos cours</h2></div><span className="count">{documents.length} document{documents.length === 1 ? '' : 's'}</span></div>
      {documents.length === 0 ? <div className="empty-state"><span>ðŸ“š</span><p>Votre bibliothÃ¨que est vide. Importez un cours pour commencer.</p></div> : <div className="document-list">{documents.map((document) => <article className="document-card" key={document.id}><div className="document-icon">{document.filename.toLowerCase().endsWith('.pdf') ? 'PDF' : 'IMG'}</div><div className="document-body"><h3>{document.filename}</h3><div className="document-meta"><span>{document.page_count} page{document.page_count > 1 ? 's' : ''}</span><span className={`status-pill ${document.status}`}>{statusLabel(document.status)}</span></div>{document.pages?.[0]?.text && <p className="preview">{document.pages[0].text.slice(0, 220)}{document.pages[0].text.length > 220 ? 'â€¦' : ''}</p>}</div></article>)}</div>}
      <div className="tutor-panel"><div className="section-label">VOTRE TUTEUR</div><h2>Une question sur vos cours ?</h2><p>Tutor.ai rÃ©pond en franÃ§ais Ã  partir du contenu extrait de votre bibliothÃ¨que.</p><form onSubmit={askTutor} className="question-form"><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex. Explique-moi cette notion simplementâ€¦" rows={3} disabled={busy} /><button className="primary" type="submit" disabled={busy || !question.trim()}>{busy ? 'RÃ©flexionâ€¦' : 'Demander Ã  Tutor.ai â†’'}</button></form>{answer && <div className="answer"><div className="answer-label">RÃ‰PONSE DE TUTOR.AI</div><div className="answer-text">{answer}</div></div>}</div>
    </section>}
    <section className="how"><div className="section-label">COMMENT Ã‡A MARCHE</div><div className="steps"><article><b>01</b><h3>Importez</h3><p>Vos notes, chapitres et anciens sujets, mÃªme photographiÃ©s.</p></article><article><b>02</b><h3>Comprenez</h3><p>Posez une question et obtenez une explication basÃ©e sur vos documents.</p></article><article><b>03</b><h3>EntraÃ®nez-vous</h3><p>GÃ©nÃ©rez ensuite des QCM et des questions structurÃ©es.</p></article></div></section>
    <footer>Un outil de rÃ©vision pensÃ© pour les Ã©lÃ¨ves du Cameroun.</footer>
  </main>;
}