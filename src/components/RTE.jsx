import React from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { Controller } from 'react-hook-form'

import 'tinymce/tinymce'; // core TinyMCE
import 'tinymce/themes/silver'; // theme
import 'tinymce/icons/default'; // icons

// Plugins you use
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';


function RTE({
    name,
    control,
    label,
    defaultValue = "",
}) {
    return (
        <div className="w-full">
            {label && (
                <label
                    className="text-sm font-medium mb-2 block"
                >
                    {label}
                </label>
            )}
            <Controller
                name={name || "content"}
                control={control}
                defaultValue={defaultValue}
                render={({ field: { onChange, value } }) => (
                    <Editor
                        tinymceScriptSrc="/tinymce/tinymce.min.js"
                        initialValue={defaultValue}
                        init={{
                            height: 500,
                            menubar: true,
                            skin: document.documentElement.classList.contains('dark') ? "oxide-dark" : "oxide",
                            content_css: document.documentElement.classList.contains('dark') ? "dark" : "default",
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                                'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'help', 'wordcount'
                            ],
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | help',
                            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; }',
                        }}
                        onEditorChange={onChange}
                        value={value}
                    />
                )}
            />
        </div>
    )
}

export default RTE