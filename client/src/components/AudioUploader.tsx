import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Upload, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AudioUploaderProps {
  onAudioUploaded: (audioUrl: string) => void;
  disabled?: boolean;
}

export function AudioUploader({ onAudioUploaded, disabled = false }: AudioUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    try {
      setIsUploading(true);
      
      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/audio/upload", {});
      const { uploadURL } = await uploadResponse.json();
      
      // Upload audio file
      await fetch(uploadURL, {
        method: 'PUT',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm',
        }
      });
      
      // Normalize the URL for use in the app
      const audioResponse = await apiRequest("POST", "/api/audio/process", {
        audioURL: uploadURL
      });
      const { audioPath } = await audioResponse.json();
      
      onAudioUploaded(audioPath);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      await uploadAudio(file);
    }
    event.target.value = ''; // Reset input
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
        disabled={disabled || isRecording || isUploading}
        className="hidden"
        id="audio-upload"
      />
      
      <label htmlFor="audio-upload">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isRecording || isUploading}
          className="p-2"
          asChild
        >
          <div>
            <Upload className="w-4 h-4" />
          </div>
        </Button>
      </label>

      <Button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isUploading}
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        className="p-2"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}