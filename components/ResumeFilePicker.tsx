'use client';

import { useState } from 'react';

interface PickerTokenResponse {
  accessToken: string;
  developerKey: string;
  appId: string;
  expectedFileId: string;
  expectedFileName: string;
  error?: string;
}

interface PickerDocument { id?: string }
interface PickerData { action?: string; docs?: PickerDocument[] }

interface PickerBuilder {
  addView(view: unknown): PickerBuilder;
  setAppId(appId: string): PickerBuilder;
  setCallback(callback: (data: PickerData) => void): PickerBuilder;
  setDeveloperKey(key: string): PickerBuilder;
  setOAuthToken(token: string): PickerBuilder;
  setOrigin(origin: string): PickerBuilder;
  build(): { setVisible(visible: boolean): void };
}

interface PickerNamespace {
  Action: { PICKED: string; CANCEL: string };
  ViewId: { DOCS: string };
  DocsView: new (viewId: string) => {
    setMimeTypes(mimeTypes: string): unknown;
    setIncludeFolders(includeFolders: boolean): unknown;
  };
  PickerBuilder: new () => PickerBuilder;
}

declare global {
  interface GoogleBrowser {
    picker?: PickerNamespace;
  }

  interface Window {
    gapi?: { load(name: string, callback: () => void): void };
    google?: GoogleBrowser;
  }
}

let pickerScriptPromise: Promise<void> | null = null;

function loadPickerScript(): Promise<void> {
  if (window.gapi) return Promise.resolve();
  if (pickerScriptPromise) return pickerScriptPromise;
  pickerScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Picker could not be loaded.'));
    document.head.appendChild(script);
  });
  return pickerScriptPromise;
}

function loadPickerModule(): Promise<PickerNamespace> {
  return new Promise((resolve, reject) => {
    if (!window.gapi) return reject(new Error('Google Picker could not be loaded.'));
    window.gapi.load('picker', () => {
      if (!window.google?.picker) return reject(new Error('Google Picker is unavailable.'));
      resolve(window.google.picker);
    });
  });
}

export default function ResumeFilePicker({ onConnected }: { onConnected: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPicker() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/google/picker-token', { cache: 'no-store' });
      const config = await response.json() as PickerTokenResponse;
      if (!response.ok) throw new Error(config.error ?? 'Secure file selection is unavailable.');
      await loadPickerScript();
      const picker = await loadPickerModule();
      const view = new picker.DocsView(picker.ViewId.DOCS);
      view.setMimeTypes('application/pdf');
      view.setIncludeFolders(false);
      const built = new picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(config.accessToken)
        .setDeveloperKey(config.developerKey)
        .setAppId(config.appId)
        .setOrigin(window.location.origin)
        .setCallback(async (data) => {
          if (data.action === picker.Action.CANCEL) setBusy(false);
          if (data.action !== picker.Action.PICKED) return;
          const fileId = data.docs?.[0]?.id;
          if (!fileId) {
            setBusy(false);
            setError('Google did not return a file selection.');
            return;
          }
          try {
            const selected = await fetch('/api/google/select-resume', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fileId }),
            });
            const result = await selected.json() as { error?: string };
            if (!selected.ok) throw new Error(result.error ?? 'PAS could not verify that file.');
            onConnected();
          } catch (selectionError) {
            setError(selectionError instanceof Error ? selectionError.message : 'PAS could not verify that file.');
          } finally {
            setBusy(false);
          }
        })
        .build();
      built.setVisible(true);
    } catch (pickerError) {
      setBusy(false);
      setError(pickerError instanceof Error ? pickerError.message : 'Secure file selection is unavailable.');
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-parc-emerald/20 bg-parc-emerald/5 p-4">
      <p className="text-sm font-black text-asphalt">Choose only the master PDF</p>
      <p className="mt-1 text-xs leading-relaxed text-asphalt/55">
        Google will show PDFs you can access. PAS accepts only PAS_Resume_MASTER.pdf and rejects every other file ID.
      </p>
      {error && <p role="alert" className="mt-3 text-xs font-bold text-plateau-pink">{error}</p>}
      <button
        type="button"
        onClick={() => void openPicker()}
        disabled={busy}
        className="mt-4 inline-flex rounded-full bg-asphalt px-5 py-3 text-sm font-bold text-white hover:bg-asphalt/85 disabled:cursor-wait disabled:opacity-50"
      >
        {busy ? 'Opening secure picker…' : 'Choose PAS_Resume_MASTER.pdf'}
      </button>
    </div>
  );
}
