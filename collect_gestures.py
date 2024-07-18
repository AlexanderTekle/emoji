import cv2
import os
import json

gestures = ["thumbs_up", "open_palm", "closed_fist", "peace_sign", "pointing_finger"]
data_dir = "hand_gesture_data"
annotations = {}

# Create directory for dataset
os.makedirs(data_dir, exist_ok=True)

cap = cv2.VideoCapture(0)

gesture_index = 0
frame_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Display the current gesture to capture
    cv2.putText(frame, f"Gesture: {gestures[gesture_index]}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    cv2.imshow('Data Collection', frame)
    #print(type(frame))

    key = cv2.waitKey(1) & 0xFF
    if key == ord('c'):  # Capture frame
        frame_name = f"{gestures[gesture_index]}_{frame_count}.jpg"
        cv2.imwrite(os.path.join(data_dir, frame_name), frame)
        
        # Let user draw bounding box
        bbox = cv2.selectROI("Draw Bounding Box", frame, fromCenter=False, showCrosshair=True)
        print(type(bbox))
        cv2.destroyWindow("Draw Bounding Box")
        print(bbox)
        
        # Save annotation
        annotations[frame_name] = {
            "gesture": gestures[gesture_index],
            "bbox": list(bbox)  # x, y, width, height
        }
        
        frame_count += 1
        print(f"Captured {frame_name}")

    elif key == ord('n'):  # Next gesture
        gesture_index = (gesture_index + 1) % len(gestures)
        frame_count = 0
    elif key == ord('q'):  # Quit
        break

cap.release()
cv2.destroyAllWindows()

# Save annotations
with open(os.path.join(data_dir, "annotations.json"), "w") as f:
    json.dump(annotations, f)