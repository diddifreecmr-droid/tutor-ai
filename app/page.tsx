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
    setBusy(true); setMessage('Creation de votre espace...');
    try {
      const response = await fetch('/api/workspaces', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Impossible de creer espace.');
      setWorkspace(data.workspaceId); setRecovery(data.recoveryCode);
      setMessage('Votre espace est pret. Ajoutez maintenant votre premier cours.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.'); }
    finally { setBusy(false); }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []); event.target.value = '';
    if (!workspace || !files.length) return;
    setBusy(true); setMessage('Enregistrement et analyse des documents...');
    const form = new FormData(); form.set('workspaceId', workspace); files.forEach((file) => form.append('files', file));
    try {
      const response = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "Echec de l'import.");
      await loadDocuments(workspace); setMessage(`${data.pages ?? files.length} page(s) importee(s). Consultez vos cours ci-dessous.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Echec de l'import."); }
    finally { setBusy(false); }
  }

  async function restore() {
    if (!restoreCode.trim()) { setMessage('Saisissez votre code de recuperation.'); return; }
    setBusy(true); setMessage('Restauration de votre espace...');
    try {
      const response = await fetch('/api/workspaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recoveryCode: restoreCode.trim() }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Code de recuperation invalide.');
      setWorkspace(data.workspaceId); setRecovery(restoreCode.trim().toUpperCase()); setMessage('Espace restaure. Vos documents sont de nouveau accessibles.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Restauration impossible.'); }
    finally { setBusy(false); }
  }

  async function askTutor(event: FormEvent) {
    event.preventDefault(); if (!workspace || !question.trim()) return;
    setBusy(true); setAnswer(''); setMessage('Tutor.ai prepare une reponse a partir de vos cours...');
    try {
      const response = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: workspace, question }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Le tuteur est indisponible.');
      setAnswer(data.answer); setMessage('Reponse basee sur votre bibliotheque.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Le tuteur est indisponible.'); }
    finally { setBusy(false); }
  }

  function copyRecovery() { if (recovery) navigator.clipboard?.writeText(recovery); setMessage('Code copie. Gardez-le dans un endroit sur.'); }
  const statusLabel = (status: string) => ({ ocr_complete: 'Texte extrait', ocr_pending: 'OCR en attente', ocr_not_configured: 'Cle OCR manquante', ocr_error: 'OCR a relancer', uploaded: 'Importe' }[status] ?? status);

  return <main className="shell">
    <header className="topbar"><div className="brand">tutor<span>.ai</span></div><div className="badge">Cameroun - Francais</div></header>
    <section className="hero">
      <div className="eyebrow">Votre espace de revision personnel</div>
      <h1>Comprenez mieux.<br /><em>Revisez avec methode.</em></h1>
      <p className="lead">Importez vos notes ou vos anciens sujets. Tutor.ai les transforme en explications claires et en exercices adaptes a votre niveau.</p>
      {!workspace ? <div className="start-card">
        <div className="step-number">1</div><div className="start-copy"><h2>Creez votre espace</h2><p>Sans inscription. Vos documents restent lies a un code de recuperation.</p></div>
        <button className="primary" onClick={createWorkspace} disabled={busy}>{busy ? 'Preparation...' : 'Commencer maintenant'} <span>-&gt;</span></button>
        <div className="restore"><span>Vous avez deja un espace ?</span><input aria-label="Code de recuperation" placeholder="Code de recuperation" value={restoreCode} onChange={(e) => setRestoreCode(e.target.value)} /><button className="link-button" onClick={restore} disabled={busy}>Restaurer</button></div>
      </div> : <div className="workspace-card">
        <div className="workspace-head"><div><div className="active"><span className="success-dot" /> Espace actif</div><h2>Ajoutez votre premier cours</h2><p>Images, photos prises avec votre telephone ou PDF scannes.</p></div><button className="small-button" onClick={copyRecovery}>Copier mon code</button></div>
        <div className="upload-grid"><label className="upload-option primary-option"><input type="file" accept="image/*,application/pdf" multiple onChange={upload} disabled={busy} /><span className="upload-icon">+</span><strong>Importer des fichiers</strong><small>PDF ou images - 10 pages max</small></label><label className="upload-option"><input type="file" accept="image/*" capture="environment" multiple onChange={upload} disabled={busy} /><span className="camera-icon">O</span><strong>Prendre des photos</strong><small>Utiliser la camera du telephone</small></label></div>
        {recovery && <div className="recovery"><span>Votre code de recuperation</span><code>{recovery}</code><button onClick={copyRecovery}>Copier</button></div>}
      </div>}
      {message && <p className="status" role="status">{message}</p>}
    </section>
    {workspace && <section className="dashboard">
      <div className="section-heading"><div><div className="section-label">VOTRE BIBLIOTHEQUE</div><h2>Vos cours</h2></div><span className="count">{documents.length} document{documents.length === 1 ? '' : 's'}</span></div>
      {documents.length === 0 ? <div className="empty-state"><span>+</span><p>Votre bibliotheque est vide. Importez un cours pour commencer.</p></div> : <div className="document-list">{documents.map((document) => <article className="document-card" key={document.id}><div className="document-icon">{document.filename.toLowerCase().endsWith('.pdf') ? 'PDF' : 'IMG'}</div><div className="document-body"><h3>{document.filename}</h3><div className="document-meta"><span>{document.page_count} page{document.page_count > 1 ? 's' : ''}</span><span className={`status-pill ${document.status}`}>{statusLabel(document.status)}</span></div>{document.pages?.[0]?.text && <p className="preview">{document.pages[0].text.slice(0, 220)}{document.pages[0].text.length > 220 ? '...' : ''}</p>}</div></article>)}</div>}
      <div className="tutor-panel"><div className="section-label">VOTRE TUTEUR</div><h2>Une question sur vos cours ?</h2><p>Tutor.ai repond en francais a partir du contenu extrait de votre bibliotheque.</p><form onSubmit={askTutor} className="question-form"><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ex. Explique-moi cette notion simplement..." rows={3} disabled={busy} /><button className="primary" type="submit" disabled={busy || !question.trim()}>{busy ? 'Reflexion...' : 'Demander a Tutor.ai ->'}</button></form>{answer && <div className="answer"><div className="answer-label">REPONSE DE TUTOR.AI</div><div className="answer-text">{answer}</div></div>}</div>
    </section>}
    <section className="how"><div className="section-label">COMMENT CA MARCHE</div><div className="steps"><article><b>01</b><h3>Importez</h3><p>Vos notes, chapitres et anciens sujets, meme photographies.</p></article><article><b>02</b><h3>Comprenez</h3><p>Posez une question et obtenez une explication basee sur vos documents.</p></article><article><b>03</b><h3>Entrainez-vous</h3><p>Generez ensuite des QCM et des questions structurees.</p></article></div></section>
    <footer>Un outil de revision pense pour les eleves du Cameroun.</footer>
  </main>;
}