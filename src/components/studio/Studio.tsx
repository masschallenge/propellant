import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createCanvasMeasure,
  downloadBlob,
  renderSceneToBlob,
  sampleBackdrops,
  waitForFonts,
} from '../../studio/canvas';
import { DEFAULT_FORMAT_ID, findFormat } from '../../studio/formats';
import {
  applyCaseRule,
  backdropFor,
  caseMessage,
  checkScene,
  constrainLogo,
  enforceTextColors,
  mostReadableOption,
  optionsForText,
  switchMessage,
  type BrandIssue,
  type SampleMap,
} from '../../studio/guardrails';
import {
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  replacePresent,
  undoHistory,
} from '../../studio/history';
import { generateLayouts, type Brief, type LayoutOption } from '../../studio/layouts';
import type { PatternId } from '../../studio/patterns';
import { reflowScene } from '../../studio/reflow';
import type { RenderAssets } from '../../studio/render';
import {
  BASE_DEFAULTS,
  addElement,
  blankScene,
  createElementId,
  findElement,
  layoutSceneText,
  layoutTextElement,
  logoWidth,
  moveLayer,
  removeElement,
  replaceElement,
  sceneFormat,
  updateElement,
  type LayerDirection,
  type LogoLockup,
  type Scene,
  type SceneElement,
  type ShapeKind,
  type TextElement,
} from '../../studio/scene';
import {
  canvasScale,
  findTextRole,
  nearestAllowedSize,
  type TextRoleId,
} from '../../studio/typography';
import { BriefDialog, type BriefDraft } from './BriefDialog';
import { LeftPanel } from './LeftPanel';
import { RightPanel, type TextPatch } from './RightPanel';
import { Stage } from './Stage';
import { ToastRegion, useToasts } from './Toasts';
import { TopBar } from './TopBar';
import {
  makeOverlayPhoto,
  overlayId,
  readPhoto,
  useFontsReady,
  useLogoImages,
  useMeasure,
  type PhotoAsset,
} from './useStudioAssets';

const EMPTY_BRIEF: BriefDraft = {
  formatId: DEFAULT_FORMAT_ID,
  smallLine: '',
  bigLine: '',
  details: '',
  callToAction: '',
  photoId: null,
};

const NEW_TEXT: Record<TextRoleId, string> = {
  headline: 'YOUR HEADLINE',
  body: 'Add your words here',
  bold: 'A small line',
};

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));

const firstHeadline = (scene: Scene) =>
  scene.elements.find(
    (element): element is TextElement => element.kind === 'text' && element.role === 'headline',
  )?.text ?? '';

export const Studio = () => {
  const fontsReady = useFontsReady();
  const measure = useMeasure(fontsReady);
  const { logos, error: logoError } = useLogoImages();
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [history, setHistory] = useState(() => createHistory(blankScene(DEFAULT_FORMAT_ID)));
  const [draftScene, setDraftScene] = useState<Scene | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isBriefOpen, setIsBriefOpen] = useState(true);
  const [brief, setBrief] = useState<BriefDraft>(EMPTY_BRIEF);
  const [layouts, setLayouts] = useState<LayoutOption[]>([]);
  const [seed, setSeed] = useState(0);
  const [isBigLineMissing, setIsBigLineMissing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [postLine, setPostLine] = useState('');
  const [samples, setSamples] = useState<SampleMap>({});
  const [isDownloading, setIsDownloading] = useState(false);
  const { toasts, showToast, dismissToast } = useToasts();
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    if (logoError) showToast({ title: 'Logo not loaded', body: logoError, tone: 'error' });
  }, [logoError, showToast]);

  const scene = draftScene ?? history.present;
  const format = sceneFormat(scene);
  const assets = useMemo<RenderAssets>(
    () => ({
      logos,
      photos: Object.fromEntries(photos.map((photo) => [photo.id, photo.image])),
    }),
    [logos, photos],
  );
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  const issues = useMemo(() => checkScene(history.present, samples), [history.present, samples]);
  const selected = findElement(scene, selectedId);
  const briefPhoto = photos.find((photo) => photo.id === brief.photoId) ?? null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('brief') === 'open') setIsBriefOpen(true);
  }, []);

  useEffect(() => {
    setHistory((current) => replacePresent(current, layoutSceneText(current.present, measure)));
  }, [measure]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSamples(sampleBackdrops(history.present, assets, measure));
    }, 120);
    return () => window.clearTimeout(timer);
  }, [history.present, assets, measure]);

  const commit = useCallback(
    (next: Scene, key: string | null = null) => {
      setHistory((current) =>
        pushHistory(current, layoutSceneText(next, measure), key, Date.now()),
      );
    },
    [measure],
  );

  const commitGuarded = useCallback(
    (next: Scene, key: string | null = null, announce = true) => {
      const laidOut = layoutSceneText(next, measure);
      const result = enforceTextColors(laidOut);
      if (announce) {
        result.switches.forEach((colorSwitch) =>
          showToast({ title: 'Color switched', body: switchMessage(colorSwitch) }),
        );
      }
      commit(result.scene, key);
    },
    [commit, measure, showToast],
  );

  const undo = useCallback(() => setHistory((current) => undoHistory(current)), []);
  const redo = useCallback(() => setHistory((current) => redoHistory(current)), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isBriefOpen || isTypingTarget(event.target)) return;
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) undo();
      else if ((key === 'z' && event.shiftKey) || key === 'y') redo();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBriefOpen, undo, redo]);

  useEffect(() => {
    if (selectedId && !findElement(history.present, selectedId)) setSelectedId(null);
  }, [history.present, selectedId]);

  const toBrief = (): Brief => ({
    formatId: brief.formatId,
    smallLine: brief.smallLine,
    bigLine: brief.bigLine,
    details: brief.details,
    callToAction: brief.callToAction,
    photo: briefPhoto
      ? { id: briefPhoto.id, width: briefPhoto.width, height: briefPhoto.height }
      : null,
  });

  const layOut = async (nextSeed: number) => {
    if (!brief.bigLine.trim()) {
      setIsBigLineMissing(true);
      return;
    }
    setIsBigLineMissing(false);
    await waitForFonts();
    setSeed(nextSeed);
    setLayouts(generateLayouts(toBrief(), nextSeed, createCanvasMeasure()));
  };

  const pickLayout = (layout: LayoutOption) => {
    commit(layout.scene);
    setPostLine(brief.bigLine);
    setSelectedId(null);
    setIsBriefOpen(false);
  };

  const startBlank = () => {
    commit(blankScene(brief.formatId));
    setPostLine(brief.bigLine);
    setSelectedId(null);
    setIsBriefOpen(false);
  };

  const addPhotoFile = async (file: File): Promise<PhotoAsset | null> => {
    try {
      const photo = await readPhoto(file);
      setPhotos((current) => [...current, photo]);
      setPhotoError(null);
      return photo;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'That photo could not be read.';
      setPhotoError(message);
      showToast({ title: 'Photo not added', body: message, tone: 'error' });
      return null;
    }
  };

  const insertElement = (element: SceneElement) => {
    commitGuarded(addElement(historyRef.current.present, element), null, false);
    setSelectedId(element.id);
  };

  const addText = (role: TextRoleId) => {
    const scale = canvasScale(format);
    const width = format.width * 0.7;
    const base: TextElement = {
      ...BASE_DEFAULTS,
      id: createElementId('text'),
      kind: 'text',
      role,
      size: findTextRole(role).defaultSize,
      colorId: 'black',
      align: 'left',
      text: NEW_TEXT[role],
      left: (format.width - width) / 2,
      top: format.height / 2 - 20 * scale,
      width,
      height: 0,
    };
    const laidOut = layoutTextElement(base, format, measure);
    const withElement = addElement(history.present, laidOut);
    const best = mostReadableOption(optionsForText(withElement, laidOut, samples));
    insertElement({ ...laidOut, colorId: best.color.id });
  };

  const addLogo = (lockup: LogoLockup) => {
    const scale = canvasScale(format);
    const height = (lockup === 'horizontal' ? 30 : 40) * scale;
    insertElement(
      constrainLogo(
        {
          ...BASE_DEFAULTS,
          id: createElementId('logo'),
          kind: 'logo',
          lockup,
          left: 24 * scale,
          top: 24 * scale,
          height,
          width: logoWidth(lockup, height),
        },
        format,
      ),
    );
  };

  const addShape = (shape: ShapeKind) => {
    const scale = canvasScale(format);
    const side = 120 * scale;
    const sizes: Record<ShapeKind, { width: number; height: number }> = {
      block: { width: side * 1.6, height: side },
      circle: { width: side, height: side },
      line: { width: side * 1.6, height: 2 * scale },
    };
    const size = sizes[shape];
    insertElement({
      ...BASE_DEFAULTS,
      id: createElementId('shape'),
      kind: 'shape',
      shape,
      colorId: shape === 'line' ? 'navy' : 'mc-blue',
      left: (format.width - size.width) / 2,
      top: (format.height - size.height) / 2,
      ...size,
    });
  };

  const addPhoto = (photo: PhotoAsset) => {
    const latestFormat = sceneFormat(historyRef.current.present);
    const width = latestFormat.width * 0.6;
    const height = (width * photo.height) / photo.width;
    insertElement({
      ...BASE_DEFAULTS,
      id: createElementId('image'),
      kind: 'image',
      photoId: photo.id,
      naturalWidth: photo.width,
      naturalHeight: photo.height,
      zoom: 1,
      left: (latestFormat.width - width) / 2,
      top: (latestFormat.height - height) / 2,
      width,
      height,
    });
  };

  const addPhotoAs = async (photo: PhotoAsset, hasOverlay: boolean) => {
    if (!hasOverlay) {
      addPhoto(photo);
      return;
    }
    const existing = photos.find((candidate) => candidate.id === overlayId(photo.id));
    try {
      const toned = existing ?? (await makeOverlayPhoto(photo));
      if (!existing) setPhotos((current) => [...current, toned]);
      addPhoto(toned);
    } catch (error) {
      showToast({
        title: 'Overlay not added',
        body: error instanceof Error ? error.message : 'The hero overlay could not be added.',
        tone: 'error',
      });
    }
  };

  const removeSelected = (id: string) => {
    commitGuarded(removeElement(history.present, id));
    setSelectedId(null);
  };

  const changeElement = (next: SceneElement, key?: string) => {
    const constrained = next.kind === 'logo' ? constrainLogo(next, format) : next;
    commitGuarded(replaceElement(history.present, constrained), key ?? null);
  };

  const changeText = (element: TextElement, patch: TextPatch) => {
    const next: TextElement = { ...element, ...patch };
    if (patch.role && patch.role !== element.role) {
      next.size = nearestAllowedSize(patch.role, element.size);
      const cased = applyCaseRule(patch.role, next.text);
      if (cased.changed && findTextRole(patch.role).capitals === 'never') {
        showToast({ title: 'Sentence case', body: caseMessage(next.text) });
      }
      next.text = cased.text;
    }
    if (patch.text !== undefined && findTextRole(next.role).capitals === 'always') {
      next.text = patch.text.toUpperCase();
    }
    const key = patch.text !== undefined ? `words-${element.id}` : null;
    commitGuarded(replaceElement(history.present, next), key);
  };

  const settleWords = (element: TextElement) => {
    const present = historyRef.current.present;
    const current = findElement(present, element.id);
    if (!current || current.kind !== 'text') return;
    const cased = applyCaseRule(current.role, current.text);
    if (!cased.changed) return;
    if (findTextRole(current.role).capitals === 'never') {
      showToast({ title: 'Sentence case', body: caseMessage(current.text) });
    }
    commitGuarded(updateElement(present, current.id, { text: cased.text }));
  };

  const changeBackground = (colorId: string) => {
    if (colorId === history.present.backgroundId && !history.present.pattern) return;
    commitGuarded({ ...history.present, backgroundId: colorId, pattern: null });
  };

  const changePattern = (pattern: PatternId | null) => {
    if ((history.present.pattern ?? null) === pattern) return;
    commitGuarded({ ...history.present, pattern });
  };

  const changeFormat = (formatId: string) => {
    setBrief((current) => ({ ...current, formatId }));
    commitGuarded(reflowScene(history.present, formatId, measure));
  };

  const moveSelectedLayer = (id: string, direction: LayerDirection) =>
    commitGuarded(moveLayer(history.present, id, direction));

  const toggleElement = (id: string, property: 'hidden' | 'locked') => {
    const element = findElement(history.present, id);
    if (!element) return;
    commitGuarded(updateElement(history.present, id, { [property]: !element[property] }));
  };

  const showIssue = (issue: BrandIssue) => {
    if (!issue.elementId) return;
    setSelectedId(issue.elementId);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-element-id="${issue.elementId}"]`)?.focus();
    });
  };

  const download = async () => {
    setIsDownloading(true);
    try {
      const target = historyRef.current.present;
      const blob = await renderSceneToBlob(target, assetsRef.current, measure);
      const targetFormat = findFormat(target.formatId);
      const fileName = downloadBlob(blob, postLine || firstHeadline(target));
      showToast({
        title: 'Downloaded',
        body: `${fileName}, ${targetFormat.width} x ${targetFormat.height} pixels.`,
        tone: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Download failed',
        body: error instanceof Error ? error.message : 'The PNG could not be made.',
        tone: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedBackdrop = selected ? backdropFor(scene, selected.id) : null;

  return (
    <div className="flex flex-col" data-studio data-backdrop={selectedBackdrop?.kind}>
      <h1 className="sr-only">Content studio</h1>
      <TopBar
        formatId={scene.formatId}
        issues={issues}
        canUndo={canUndo(history)}
        canRedo={canRedo(history)}
        isDownloading={isDownloading}
        onOpenBrief={() => setIsBriefOpen(true)}
        onFormat={changeFormat}
        onUndo={undo}
        onRedo={redo}
        onIssue={showIssue}
        onDownload={download}
      />
      <div className="grid grid-cols-1 lg:h-[calc(100dvh-7.5rem)] lg:grid-cols-[260px_minmax(0,1fr)_340px]">
        <div className="order-3 border-t border-solid border-[var(--separator)] lg:order-1 lg:overflow-y-auto lg:border-r lg:border-t-0">
          <LeftPanel
            scene={history.present}
            selectedId={selectedId}
            photos={photos}
            onAddText={addText}
            onAddLogo={addLogo}
            onAddShape={addShape}
            onAddPhoto={addPhotoAs}
            onUploadPhoto={async (file, hasOverlay) => {
              const photo = await addPhotoFile(file);
              if (photo) await addPhotoAs(photo, hasOverlay);
            }}
            onBackground={changeBackground}
            onPattern={changePattern}
            onSelect={setSelectedId}
            onMove={moveSelectedLayer}
            onToggle={toggleElement}
            onRemove={removeSelected}
          />
        </div>
        <div className="order-1 h-[min(75vh,640px)] bg-[var(--bg-secondary)] p-4 lg:order-2 lg:h-auto lg:min-h-0 lg:p-6">
          <Stage
            scene={scene}
            assets={assets}
            measure={measure}
            fontsReady={fontsReady}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCommit={(next, key) => commitGuarded(next, key ?? null)}
            onDraft={setDraftScene}
            onRemove={removeSelected}
          />
        </div>
        <div className="order-2 border-t border-solid border-[var(--separator)] lg:order-3 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <RightPanel
            scene={history.present}
            element={findElement(history.present, selectedId)}
            samples={samples}
            onChange={changeElement}
            onTextChange={changeText}
            onWordsSettled={settleWords}
            onRemove={removeSelected}
          />
        </div>
      </div>
      <BriefDialog
        open={isBriefOpen}
        draft={brief}
        photo={briefPhoto}
        layouts={layouts}
        isBigLineMissing={isBigLineMissing}
        photoError={photoError}
        assets={assets}
        measure={measure}
        onDraft={(patch) => {
          setBrief((current) => ({ ...current, ...patch }));
          if (patch.bigLine) setIsBigLineMissing(false);
        }}
        onPhotoFile={async (file) => {
          const photo = await addPhotoFile(file);
          if (photo) setBrief((current) => ({ ...current, photoId: photo.id }));
        }}
        onLayOut={() => layOut(seed)}
        onShuffle={() => layOut(seed + 1)}
        onPick={pickLayout}
        onStartBlank={startBlank}
        onClose={() => setIsBriefOpen(false)}
      />
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Studio;
