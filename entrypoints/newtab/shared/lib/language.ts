const settingsDescription = resolveSettingsDescription();

export const UI_LANGUAGE = {
  bookmarks: {
    action: {
      add: "Add",
      cancel: "Cancel",
      edit: "Edit",
      move: "Move",
      moveDown: "Move down",
      moveFolder: "Move",
      moveFolderDown: "Move down",
      moveFolderUp: "Move up",
      moveUp: "Move up",
      remove: "Remove",
      removeFolder: "Remove folder",
      renameFolder: "Rename",
      save: "Save",
      saveFolder: "Save",
    },
    description: {
      saveTo: "Choose a folder in this bookmark source.",
    },
    error: {
      invalidUrl: "Enter a valid URL",
    },
    label: {
      saveTo: "Save to",
      source: "Bookmarks",
      sourceGroup: "Bookmarks",
      title: "Title",
      url: "URL",
    },
    message: {
      noResults: "No results.",
    },
    placeholder: {
      title: "Title",
      url: "URL",
    },
    title: {
      add: "Add",
      root: "Root bookmarks",
    },
  },
  search: {
    label: "Search",
    placeholder: "Search",
  },
  settings: {
    appearance: {
      bookmarkIcon: {
        description: settingsDescription.appearance.bookmarkIcon,
      },
      fontFamily: {
        description: settingsDescription.appearance.fontFamily,
      },
      fontSize: {
        description: settingsDescription.appearance.fontSize,
      },
    },
    date: {
      customFormat: {
        description: settingsDescription.date.customFormat,
      },
    },
    shortcut: {
      hints: {
        description: settingsDescription.shortcut.hints,
      },
    },
    time: {
      seconds: {
        description: settingsDescription.time.seconds,
      },
    },
  },
} as const;

function resolveSettingsDescription() {
  const description = {
    en: {
      appearance: {
        bookmarkIcon: "Choose how bookmark icons appear.",
        fontFamily: "Use a font installed on this device.",
        fontSize: "Adjust the date, time, and bookmark text size.",
      },
      date: {
        customFormat: "Use YYYY, MMM, MM, DD, D, ddd, or dddd.",
      },
      shortcut: {
        hints: "Show keyboard shortcut hints in the footer.",
      },
      time: {
        seconds: "Include seconds in the clock.",
      },
    },
    es: {
      appearance: {
        bookmarkIcon: "Elige cómo se muestran los iconos de los marcadores.",
        fontFamily: "Usa una fuente instalada en este dispositivo.",
        fontSize: "Ajusta el tamaño del texto de fecha, hora y marcadores.",
      },
      date: {
        customFormat: "Usa YYYY, MMM, MM, DD, D, ddd o dddd.",
      },
      shortcut: {
        hints: "Muestra atajos de teclado en el pie.",
      },
      time: {
        seconds: "Incluye segundos en el reloj.",
      },
    },
    ja: {
      appearance: {
        bookmarkIcon: "ブックマークアイコンの表示方法を選びます。",
        fontFamily: "このデバイスにインストールされたフォントを使います。",
        fontSize: "日付、時刻、ブックマークの文字サイズを調整します。",
      },
      date: {
        customFormat: "YYYY、MMM、MM、DD、D、ddd、dddd を使えます。",
      },
      shortcut: {
        hints: "フッターにキーボードショートカットのヒントを表示します。",
      },
      time: {
        seconds: "時計に秒を表示します。",
      },
    },
    ko: {
      appearance: {
        bookmarkIcon: "북마크 아이콘을 어떻게 표시할지 선택합니다.",
        fontFamily: "이 기기에 설치된 글꼴을 사용합니다.",
        fontSize: "날짜, 시간, 북마크 텍스트 크기를 조정합니다.",
      },
      date: {
        customFormat: "YYYY, MMM, MM, DD, D, ddd, dddd를 사용할 수 있습니다.",
      },
      shortcut: {
        hints: "푸터에 키보드 단축키 힌트를 표시합니다.",
      },
      time: {
        seconds: "시계에 초를 표시합니다.",
      },
    },
    zh: {
      appearance: {
        bookmarkIcon: "选择书签图标的显示方式。",
        fontFamily: "使用此设备上安装的字体。",
        fontSize: "调整日期、时间和书签文字大小。",
      },
      date: {
        customFormat: "可使用 YYYY、MMM、MM、DD、D、ddd 或 dddd。",
      },
      shortcut: {
        hints: "在页脚显示键盘快捷键提示。",
      },
      time: {
        seconds: "在时钟中显示秒数。",
      },
    },
  } as const;

  const locale = navigator.language.split("-")[0];

  return locale in description ? description[locale as keyof typeof description] : description.en;
}
