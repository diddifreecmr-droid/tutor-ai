'use client';

import { ChangeEvent, useState } from 'react';

export default function Home() {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [restoreCode, setRestoreCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function createWorkspace() {
    setBusy(true); setMessage('Création de votre espace…');
    try {
      const response = await fetch('/api/workspaces', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Impossible de créer l’espace.');
      setWorkspace(data.workspaceId); setRecovery(data.recoveryCode);
      setMessage('Votre espace est prêt. Ajoutez maintenant votre premier cours.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Une erreur est survenue.'); }
    finally { setBusy(false); }
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!workspace || !files.length) return;
    setBusy(true); setMessage('Analyse des documents en cours…');
    const form = new FormData(); form.set('workspaceId', workspace);
    files.forEach((file) => form.append('files', file));
    try {
      const response = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Échec de l’import.');
      setMessage(`${data.pages ?? files.length} page(s) importée(s). Vous pouvez maintenant poser une question.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Échec de l’import.'); }
    finally { setBusy(false); }
  }

  function copyRecovery() {
    if (recovery) navigator.clipboard?.writeText(recovery);
    setMessage('Code copié. Gardez-le dans un endroit sûr.');
  }

  async function restore() {
    if (!restoreCode.trim()) { setMessage('Saisissez votre code de récupération.'); return; }
    setBusy(true); setMessage('Restauration de votre espace…');
    try {
      const response = await fetch('/api/workspaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recoveryCode: restoreCode.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Code de récupération invalide.');
      setWorkspace(data.workspaceId); setRecovery(restoreCode.trim().toUpperCase()); setMessage('Espace restauré. Vos documents sont de nouveau accessibles.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Restauration impossible.'); }
    finally { setBusy(false); }
  }

  return <main className="shell">
    <header className="topbar"><div className="brand">tutor<span>.ai</span></div><div className="badge">Cameroun · Français</div></header>
    <section className="hero">
      <div className="eyebrow">Votre espace de révision personnel</div>
      <h1>Comprenez mieux.<br /><em>Révisez avec méthode.</em></h1>
      <p className="lead">Importez vos notes ou vos anciens sujets. Tutor.ai les transforme en explications claires et en exercices adaptés à votre niveau.</p>
      {!workspace ? <div className="start-card">
        <div className="step-number">1</div>
        <div className="start-copy"><h2>Créez votre espace</h2><p>Sans inscription. Vos documents restent liés à un code de récupération.</p></div>
        <button className="primary" onClick={createWorkspace} disabled={busy}>{busy ? 'Préparation…' : 'Commencer maintenant'} <span>→</span></button>
        <div className="restore"><span>Vous avez déjà un espace ?</span><input aria-label="Code de récupération" placeholder="Code de récupération" value={restoreCode} onChange={(e) => setRestoreCode(e.target.value)} /><button className="link-button" onClick={restore}>Restaurer</button></div>
      </div> : <div className="workspace-card">
        <div className="workspace-head"><div><div className="active"><span className="success-dot" /> Espace actif</div><h2>Ajoutez votre premier cours</h2><p>Images, photos prises avec votre téléphone ou PDF scannés.</p></div><button className="small-button" onClick={copyRecovery}>Copier mon code</button></div>
        <div className="upload-grid">
          <label className="upload-option primary-option"><input type="file" accept="image/*,application/pdf" multiple onChange={upload} disabled={busy} /><span className="upload-icon">↑</span><strong>Importer des fichiers</strong><small>PDF ou images · 10 pages max</small></label>
          <label className="upload-option"><input type="file" accept="image/*" capture="environment" multiple onChange={upload} disabled={busy} /><span className="camera-icon">⌾</span><strong>Prendre des photos</strong><small>Utiliser la caméra du téléphone</small></label>
        </div>
        {recovery && <div className="recovery"><span>Votre code de récupération</span><code>{recovery}</code><button onClick={copyRecovery}>Copier</button></div>}
      </div>}
      {message && <p className="status" role="status">{message}</p>}
    </section>
    <section className="how"><div className="section-label">COMMENT ÇA MARCHE</div><div className="steps"><article><b>01</b><h3>Importez</h3><p>Vos notes, chapitres et anciens sujets, même photographiés.</p></article><article><b>02</b><h3>Comprenez</h3><p>Posez une question et obtenez une explication basée sur vos documents.</p></article><article><b>03</b><h3>Entraînez-vous</h3><p>Générez des QCM et des questions structurées pour vérifier vos acquis.</p></article></div></section>
    <footer>Un outil de révision pensé pour les élèves du Cameroun.</footer>
  </main>;
}

